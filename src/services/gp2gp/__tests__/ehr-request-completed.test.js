import { v4 as uuid } from 'uuid';
import { storeMessageInEhrRepo } from '../../ehr';
import { extractNhsNumber } from '../../parser/message';
import { parseMultipartBody } from '../../parser';
import { soapEnvelopeHandler } from '../../soap';
import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from '../ehr-request-completed';
import { logEvent, logError } from '../../../middleware/logging';
import { sendEhrMessageReceived } from '../../gp-to-repo/send-ehr-message-received';

jest.mock('../../parser/multipart-parser', () => ({
  parseMultipartBody: jest
    .fn()
    .mockResolvedValue([{ body: 'some-message' }, { body: 'another-message' }])
}));

jest.mock('../../soap/soap-envelope-handler', () => ({
  soapEnvelopeHandler: jest.fn().mockResolvedValue({ info: 'soap-information' })
}));

jest.mock('../../parser/message/extract-nhs-number', () => ({
  extractNhsNumber: jest.fn().mockResolvedValue('1234567890')
}));

jest.mock('../../ehr/store-message-in-ehr-repo');
jest.mock('../../../middleware/logging');
jest.mock('../../gp-to-repo/send-ehr-message-received');

const ehrRequestCompleted = new EHRRequestCompleted();
const mockMessage = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';

describe('EHRRequestCompleted', () => {
  it('should return "Electronic Healthcare Record Request Completed (GP2GP v1.1)" when calling name', () => {
    expect(ehrRequestCompleted.name).toBe(
      'Electronic Healthcare Record Request Completed (GP2GP v1.1)'
    );
  });

  it('should return EHR_REQUEST_COMPLETED when calling interactionId', () => {
    expect(ehrRequestCompleted.interactionId).toBe(EHR_REQUEST_COMPLETED);
  });

  describe('handleMessage', () => {
    it('should call parseMultipartBody', async () => {
      await ehrRequestCompleted.handleMessage(mockMessage);
      expect(parseMultipartBody).toHaveBeenCalledTimes(1);
      expect(parseMultipartBody).toHaveBeenCalledWith(mockMessage);
    });

    it('should call soapEnvelopeHandler', async () => {
      await ehrRequestCompleted.handleMessage(mockMessage);
      expect(soapEnvelopeHandler).toHaveBeenCalledTimes(1);
      expect(soapEnvelopeHandler).toHaveBeenCalledWith('some-message');
    });

    it('should call extractNhsNumber', async () => {
      await ehrRequestCompleted.handleMessage(mockMessage);
      expect(extractNhsNumber).toHaveBeenCalledTimes(1);
      expect(extractNhsNumber).toHaveBeenCalledWith('another-message');
    });

    it('should call storeMessageInEhrRepo', async () => {
      await ehrRequestCompleted.handleMessage(mockMessage);
      expect(storeMessageInEhrRepo).toHaveBeenCalledTimes(1);
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        mockMessage,
        expect.objectContaining({ info: 'soap-information', nhsNumber: '1234567890' })
      );
    });

    it('should call storeMessageInEhrRepo without nhsNumber if not extracted', async done => {
      extractNhsNumber.mockRejectedValue('no NHS number found');
      await ehrRequestCompleted.handleMessage(mockMessage);
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        mockMessage,
        expect.not.objectContaining({
          nhsNumber: '1234567890'
        })
      );
      done();
    });

    it('should send ehr message received notification with conversationId and messageId', async () => {
      const conversationId = uuid();
      const messageId = uuid();
      const soapInformation = { conversationId, messageId };
      soapEnvelopeHandler.mockResolvedValue(soapInformation);
      storeMessageInEhrRepo.mockResolvedValue();
      await ehrRequestCompleted.handleMessage(mockMessage);

      expect(storeMessageInEhrRepo).toHaveBeenCalledTimes(1);
      expect(sendEhrMessageReceived).toHaveBeenCalledWith(conversationId, messageId);
      expect(logEvent).toHaveBeenCalledWith('EHR Message Received Notification sent');
    });

    it('should not send ehr message received notification when storeMessageInEhrRepo unsuccessful', async () => {
      const conversationId = uuid();
      const messageId = uuid();
      const soapInformation = { conversationId, messageId };
      const error = new Error('error');
      soapEnvelopeHandler.mockResolvedValue(soapInformation);
      storeMessageInEhrRepo.mockRejectedValue(error);
      await ehrRequestCompleted.handleMessage(mockMessage);

      expect(sendEhrMessageReceived).not.toHaveBeenCalled();
      expect(logError).toHaveBeenCalled();
    });

    it('should log error when sendEhrMessageReceived unsuccessful', async () => {
      const conversationId = uuid();
      const messageId = uuid();
      const soapInformation = { conversationId, messageId };
      const error = new Error('error');
      soapEnvelopeHandler.mockResolvedValue(soapInformation);
      storeMessageInEhrRepo.mockResolvedValue();
      sendEhrMessageReceived.mockRejectedValue(error);
      await ehrRequestCompleted.handleMessage(mockMessage);

      expect(sendEhrMessageReceived).toHaveBeenCalled();
      expect(logError).toHaveBeenCalled();
    });

    it('should call logEvent with status as "Parsing RCMR_IN030000UK06 Message"', async () => {
      await ehrRequestCompleted.handleMessage(mockMessage);
      expect(logEvent).toHaveBeenCalledWith(
        `Parsing ${ehrRequestCompleted.interactionId} Message`,
        expect.anything()
      );
    });

    it('should call logEvent with the parser information', async () => {
      await ehrRequestCompleted.handleMessage(mockMessage);
      expect(logEvent).toHaveBeenCalledWith(
        `Parsing ${ehrRequestCompleted.interactionId} Message`,
        expect.objectContaining({
          parser: expect.objectContaining({
            name: ehrRequestCompleted.name,
            interactionId: ehrRequestCompleted.interactionId
          })
        })
      );
    });

    it('should call logEvent with the status as "SOAP Information Extracted"', async () => {
      await ehrRequestCompleted.handleMessage(mockMessage);
      expect(logEvent).toHaveBeenCalledWith('SOAP Information Extracted', expect.anything());
    });

    it('should call logEvent with messageDetails', async () => {
      await ehrRequestCompleted.handleMessage(mockMessage);
      expect(logEvent).toHaveBeenCalledWith(
        'SOAP Information Extracted',
        expect.objectContaining({
          messageDetails: expect.any(Object)
        })
      );
    });
  });
});
