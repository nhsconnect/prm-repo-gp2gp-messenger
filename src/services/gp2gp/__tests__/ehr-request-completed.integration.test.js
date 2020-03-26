import { EHRRequestCompleted } from '../';
import { storeMessageInEhrRepo } from '../../ehr';
import {
  conversationId,
  ehrRequestCompletedMessage,
  exampleEHRRequestCompleted,
  messageId,
  messageWithoutConversationId,
  messageWithoutMessageId,
  nhsNumber,
  noNhsNumber
} from './data/ehr-request-completed';

jest.mock('axios');
jest.mock('../../ehr', () => ({
  storeMessageInEhrRepo: jest.fn()
}));

describe('EHRRequestCompleted', () => {
  describe('handleMesage', () => {
    it('should reject the promise if message does not contain a conversation id', () => {
      return expect(
        new EHRRequestCompleted().handleMessage(messageWithoutConversationId)
      ).rejects.toEqual(new Error("The key 'ConversationId' was not found in the message"));
    });

    it('should reject the promise if message does not contain a message id', () => {
      return expect(
        new EHRRequestCompleted().handleMessage(messageWithoutMessageId)
      ).rejects.toEqual(new Error("The key 'MessageId' was not found in the message"));
    });

    it('should call storeMessageInEhrRepo with full message and soapInformation', async done => {
      await new EHRRequestCompleted().handleMessage(exampleEHRRequestCompleted);
      expect(storeMessageInEhrRepo).toHaveBeenCalledTimes(1);
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        exampleEHRRequestCompleted,
        expect.objectContaining({
          action: 'RCMR_IN030000UK06',
          conversationId,
          manifest: [],
          messageId
        })
      );
      done();
    });

    it('should call storeMessageInEhrRepo with message, conversationId and messageId', async done => {
      await new EHRRequestCompleted().handleMessage(ehrRequestCompletedMessage);

      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        ehrRequestCompletedMessage,
        expect.objectContaining({
          conversationId,
          messageId
        })
      );
      done();
    });

    it('should call storeMessageInEhrRepo with message and manifest (array of messageIds)', async done => {
      const manifest = ['FE6A40B9-F4C6-4041-A306-EA2A149411CD'];
      await new EHRRequestCompleted().handleMessage(ehrRequestCompletedMessage);
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        ehrRequestCompletedMessage,
        expect.objectContaining({
          manifest
        })
      );
      done();
    });

    it('should call storeMessageInEhrRepo with NHS number if NHS number found in message', async done => {
      await new EHRRequestCompleted().handleMessage(ehrRequestCompletedMessage);

      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        ehrRequestCompletedMessage,
        expect.objectContaining({
          nhsNumber
        })
      );
      done();
    });

    it('should call storeMessageInEhrRepo without NHS number if NHS number is not found in message', async done => {
      await new EHRRequestCompleted().handleMessage(noNhsNumber);

      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        noNhsNumber,
        expect.not.objectContaining({ nhsNumber: undefined })
      );
      done();
    });
  });
});
