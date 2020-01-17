import axios from 'axios';
import config from '../config';
import { storeMessageInEhrRepo } from './ehr-repo-gateway';
import { updateLogEvent } from '../middleware/logging';

jest.mock('axios');

jest.mock('../middleware/logging');

describe('ehr-repo-gateway', () => {
  describe('storeMessageInEhrRepo', () => {
    const message = 'some-message';
    const conversationId = 'some-conversation-id';
    const messageId = 'some-message-id';

    beforeEach(() => {
      jest.resetAllMocks();

      axios.post.mockResolvedValue({ data: 'some-url' });
      axios.put.mockResolvedValue({ status: 200 });
    });

    it('should make request with conversation id and message id', () => {
      return storeMessageInEhrRepo(message, conversationId, messageId).then(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `${config.ehrRepoUrl}/health-record/${conversationId}/message`,
          {
            messageId
          }
        );
      });
    });

    it('should make put request using the url from the response body', () => {
      return storeMessageInEhrRepo(message, conversationId, messageId).then(() => {
        expect(axios.put).toHaveBeenCalledWith('some-url', message);
      });
    });

    it('should make put request to ehr repo service with transfer complete flag', () => {
      return storeMessageInEhrRepo(message, conversationId, messageId).then(() => {
        expect(
          axios.put
        ).toHaveBeenCalledWith(
          `${config.ehrRepoUrl}/health-record/${conversationId}/message/${messageId}`,
          { transferComplete: true }
        );
      });
    });

    it('should not make put request to ehr repo service when storing message fails', () => {
      axios.put.mockRejectedValue('some-error');

      return expect(storeMessageInEhrRepo(message, conversationId, messageId))
        .rejects.toBeTruthy()
        .then(() => {
          expect(axios.put).toHaveBeenCalledTimes(1);
        });
    });

    it('should update the log event when the transfer has completed successfully', () => {
      return storeMessageInEhrRepo(message, conversationId, messageId).then(() => {
        expect(updateLogEvent).toHaveBeenCalledWith({
          ehrRepository: { transferSuccessful: true }
        });
      });
    });
  });
});
