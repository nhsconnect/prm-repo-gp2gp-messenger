import { PDSGeneralUpdateRequestAccepted } from '../pds-general-update-request-accepted';
import {
  messageWithoutConversationId,
  messageWithoutMessageId
} from './data/pds-generate-update-request-accepted';

jest.mock('../../../middleware/logging');

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
  });
});
