import { v4 as uuid } from 'uuid';
import { EhrRequest } from '../ehr-request';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import { parseMultipartBody } from '../../parser';
import { extractNhsNumber } from '../../parser/message';
import { sendEhrRequest } from '../../repo-to-gp/send-ehr-request';
import { extractOdsCode } from '../../parser/message/extract-ods-code';
import { extractConversationId } from '../../parser/soap';

jest.mock('../../../middleware/logging');
jest.mock('../../repo-to-gp/send-ehr-request');
jest.mock('../../parser/message/extract-nhs-number');
jest.mock('../../parser/soap/extract-conversation-id');
jest.mock('../../parser/message/extract-ods-code');
jest.mock('../../parser/multipart-parser', () => ({
  parseMultipartBody: jest
    .fn()
    .mockResolvedValue([{ body: 'some-message' }, { body: 'another-message' }])
}));

describe('EhrRequest', () => {
  const ehrRequest = new EhrRequest();
  const mockMessage = '<RCMR_IN010000UK05 xmlns="urn:hl7-org:v3"/>';
  const expectedNhsNumber = '1234567890';
  const expectedOdsCode = 'B12345';
  const expectedConversationId = uuid();

  it('should return "Received EHR Request" when calling name', () => {
    expect(ehrRequest.name).toBe('Received EHR Request');
  });

  it('should return RCMR_IN010000UK05 when calling interactionId', () => {
    expect(ehrRequest.interactionId).toBe('RCMR_IN010000UK05');
  });

  describe('handleMessage', () => {
    it('should updateLogEvent when handleMessage is called', async () => {
      extractConversationId.mockResolvedValue(expectedConversationId);
      extractNhsNumber.mockResolvedValue(expectedNhsNumber);
      extractOdsCode.mockResolvedValue(expectedOdsCode);
      await ehrRequest.handleMessage(mockMessage);
      expect(updateLogEvent).toHaveBeenCalledTimes(2);
      expect(updateLogEvent).toBeCalledWith(
        expect.objectContaining({ status: 'Parsing RCMR_IN010000UK05 Message' })
      );
    });

    it('should call parseMultipartBody', async () => {
      await ehrRequest.handleMessage(mockMessage);
      expect(parseMultipartBody).toHaveBeenCalledTimes(1);
      expect(parseMultipartBody).toHaveBeenCalledWith(mockMessage);
    });

    it('should call soapEnvelopeHandler', async () => {
      await ehrRequest.handleMessage(mockMessage);
      expect(extractConversationId).toHaveBeenCalledTimes(1);
      expect(extractConversationId).toHaveBeenCalledWith('some-message');
    });

    it('should call extractNhsNumber', async () => {
      await ehrRequest.handleMessage(mockMessage);
      expect(extractNhsNumber).toHaveBeenCalledTimes(1);
      expect(extractNhsNumber).toHaveBeenCalledWith('another-message');
    });

    it('should call extractOdsCode', async () => {
      await ehrRequest.handleMessage(mockMessage);
      expect(extractOdsCode).toHaveBeenCalledTimes(1);
      expect(extractOdsCode).toHaveBeenCalledWith('another-message');
    });

    it('should call sendEhrRequest when message has successfully been parsed', async () => {
      extractConversationId.mockResolvedValue(expectedConversationId);
      extractNhsNumber.mockResolvedValue(expectedNhsNumber);
      extractOdsCode.mockResolvedValue(expectedOdsCode);
      await ehrRequest.handleMessage(mockMessage);
      expect(updateLogEvent).toHaveBeenCalledTimes(2);
      expect(sendEhrRequest).toHaveBeenCalledTimes(1);
      expect(sendEhrRequest).toBeCalledWith(
        expectedNhsNumber,
        expectedConversationId,
        expectedOdsCode
      );
    });

    it('should catch and updateLogEventWithError when cannot sendEhrRequest', async () => {
      sendEhrRequest.mockRejectedValue('rejected');
      await ehrRequest.handleMessage(mockMessage);
      expect(sendEhrRequest).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith('rejected');
    });

    it('should catch and updateLogEventWithError when cannot parseMultipartBody', async () => {
      parseMultipartBody.mockRejectedValue('rejected');
      await ehrRequest.handleMessage(mockMessage);
      expect(parseMultipartBody).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith('rejected');
    });
  });
});
