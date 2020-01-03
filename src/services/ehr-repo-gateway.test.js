import axios from 'axios';
import { fetchStorageUrl } from './ehr-repo-gateway';
import config from '../config';

jest.mock('axios');

describe('ehr-repo-gateway', () => {
  describe('fetchStorageUrl', () => {
    const conversationId = 'some-conversation-id';
    const messageId = 'some-message-id';

    it('should make request with conversation id and message id', () => {
      axios.post.mockResolvedValue({});

      return fetchStorageUrl(conversationId, messageId).then(() => {
        expect(axios.post).toHaveBeenCalledWith(
          `${config.ehrRepoUrl}/health-record/${conversationId}/message`,
          {
            messageId
          }
        );
      });
    });

    it('should return the url from the response body', () => {
      axios.post.mockResolvedValue({ data: 'some-url' });

      return fetchStorageUrl(conversationId, messageId).then(url => {
        expect(url).toEqual('some-url');
      });
    });
  });
});
