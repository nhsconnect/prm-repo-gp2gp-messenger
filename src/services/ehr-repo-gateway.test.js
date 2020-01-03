import axios from 'axios';
import config from '../config';
import { storeMessageInEhrRepo } from './ehr-repo-gateway';

jest.mock('axios');

describe('ehr-repo-gateway', () => {
  describe('storeMessageInEhrRepo', () => {
    const message = 'some-message';
    const conversationId = 'some-conversation-id';
    const messageId = 'some-message-id';

    it('should make request with conversation id and message id', () => {
      axios.post.mockResolvedValue({});

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
      axios.post.mockResolvedValue({ data: 'some-url' });

      return storeMessageInEhrRepo(message, conversationId, messageId).then(() => {
        expect(axios.put).toHaveBeenCalledWith('some-url', message);
      });
    });
  });
});
