import { updateLogEvent } from '../../../middleware/logging';
import { PDSGeneralUpdateRequestAccepted } from '../pds-general-update-request-accepted';
import {
  conversationId,
  messageId,
  messageWithoutConversationId,
  messageWithoutMessageId,
  pdsGenerateUpdateRequest
} from './data/pds-generate-update-request-accepted';

jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn()
}));

describe('PDSGeneralUpdateRequestAccepted', () => {
  describe('handleMessage', () => {
    it('should reject the promise if message does not contain a conversation id', () => {
      return expect(
        new PDSGeneralUpdateRequestAccepted().handleMessage(messageWithoutConversationId)
      ).rejects.toEqual(new Error(`The key 'ConversationId' was not found in the message`));
    });

    it('should reject the promise if message does not contain a message id', () => {
      return expect(
        new PDSGeneralUpdateRequestAccepted().handleMessage(messageWithoutMessageId)
      ).rejects.toEqual(new Error(`The key 'MessageId' was not found in the message`));
    });

    it('should call updateLogEvent to update status', async done => {
      await new PDSGeneralUpdateRequestAccepted().handleMessage(pdsGenerateUpdateRequest);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Handling PDS General Update Request Accepted (PRPA_IN000202UK01) Message',
          message: expect.objectContaining({
            conversationId,
            messageId,
            action: 'PRPA_IN000202UK01'
          })
        })
      );
      done();
    });
  });
});
