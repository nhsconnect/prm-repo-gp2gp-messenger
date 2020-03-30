import { storeMessageInEhrRepo } from '../../ehr';
import { extractNhsNumber } from '../../parser/message/extract-nhs-number';
import { parseMultipartBody } from '../../parser/multipart-parser';
import { soapEnvelopeHandler } from '../../soap/soap-envelope-handler';
import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from '../ehr-request-completed';
import { updateLogEvent } from '../../../middleware/logging';

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

const ehrRequestCompleted = new EHRRequestCompleted();
const mockMessage = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';

describe('EHRRequestCompleted', () => {
  beforeEach(async () => {
    await ehrRequestCompleted.handleMessage(mockMessage);
  });

  it('should return "Electronic Healthcare Record Request Completed (GP2GP v1.1)" when calling name', () => {
    expect(ehrRequestCompleted.name).toBe(
      'Electronic Healthcare Record Request Completed (GP2GP v1.1)'
    );
  });

  it('should return EHR_REQUEST_COMPLETED when calling interactionId', () => {
    expect(ehrRequestCompleted.interactionId).toBe(EHR_REQUEST_COMPLETED);
  });

  describe('handleMessage', () => {
    it('should call parseMultipartBody', () => {
      expect(parseMultipartBody).toHaveBeenCalledTimes(1);
      expect(parseMultipartBody).toHaveBeenCalledWith(mockMessage);
    });

    it('should call soapEnvelopeHandler', () => {
      expect(soapEnvelopeHandler).toHaveBeenCalledTimes(1);
      expect(soapEnvelopeHandler).toHaveBeenCalledWith('some-message');
    });

    it('should call extractNhsNumber', () => {
      expect(extractNhsNumber).toHaveBeenCalledTimes(1);
      expect(extractNhsNumber).toHaveBeenCalledWith('another-message');
    });

    it('should call storeMessageInEhrRepo', () => {
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

    it('should call updateLogEvent with status as "Parsing RCMR_IN030000UK06 Message"', () => {
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: `Parsing ${ehrRequestCompleted.interactionId} Message`
        })
      );
    });

    it('should call updateLogEvent with the parser information', () => {
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          parser: expect.objectContaining({
            name: ehrRequestCompleted.name,
            interactionId: ehrRequestCompleted.interactionId
          })
        })
      );
    });

    it('should call updateLogEvent with the status as "SOAP Information Extracted"', () => {
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'SOAP Information Extracted'
        })
      );
    });

    it('should call updateLogEvent with messageDetails', () => {
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          messageDetails: expect.any(Object)
        })
      );
    });
  });
});
