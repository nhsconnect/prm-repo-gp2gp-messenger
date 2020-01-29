import axios from 'axios';
import config from '../config';
import { storeMessageInEhrRepo } from './ehr-repo-gateway';
import { updateLogEvent } from '../middleware/logging';
import axiosRetry from 'axios-retry';

jest.mock('axios');
jest.mock('axios-retry');
jest.mock('../middleware/logging');
axiosRetry.mockImplementation(() => jest.fn());

describe('ehr-repo-gateway', () => {
  describe('storeMessageInEhrRepo', () => {
    const message = 'some-message';
    const conversationId = 'some-conversation-id';
    const messageId = 'some-message-id';

    beforeEach(() => {
      jest.resetAllMocks();

      axios.post.mockResolvedValue({ data: 'some-url' });
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
      axios.put.mockResolvedValue({ status: 200 });
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

      return storeMessageInEhrRepo(message, conversationId, messageId).then(() => {
        expect(axios.put).toHaveBeenCalledTimes(1);
      });
    });

    it('should update the log event when the transfer has completed successfully', () => {
      axios.put.mockResolvedValue({ status: 200 });
      return storeMessageInEhrRepo(message, conversationId, messageId).then(() => {
        expect(updateLogEvent).toHaveBeenCalledWith({
          ehrRepository: { transferSuccessful: true }
        });
      });
    });

    it('should update the log event when the transfer has not completed successfully', () => {
      axios.put.mockRejectedValue({ stack: 'some-error' });
      return storeMessageInEhrRepo(message, conversationId, messageId).then(() => {
        expect(updateLogEvent).toHaveBeenNthCalledWith(1, {
          status: 'Storing EHR in s3 bucket',
          ehrRepository: { url: 'some-url' }
        });

        expect(updateLogEvent).toHaveBeenNthCalledWith(2, {
          status: 'failed to store message to s3 via pre-signed url',
          error: 'some-error'
        });

        expect(updateLogEvent).toHaveBeenNthCalledWith(3, {
          status: 'failed to store message to ehr repository',
          error: 'some-error'
        });
      });
    });
  });
});
