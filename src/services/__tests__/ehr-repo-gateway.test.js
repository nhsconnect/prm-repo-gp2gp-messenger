import axios from 'axios';
import axiosRetry from 'axios-retry';
import config from '../../config';
import { updateLogEvent } from '../../middleware/logging';
import { storeMessageInEhrRepo } from '../ehr-repo-gateway';

jest.mock('axios');
jest.mock('axios-retry');
jest.mock('../../middleware/logging');
axiosRetry.mockImplementation(() => jest.fn());

describe('ehr-repo-gateway', () => {
  describe('storeMessageInEhrRepo', () => {
    const message = 'some-message';
    const conversationId = 'some-conversation-id';
    const messageId = 'some-message-id';

    beforeEach(() => {
      axios.patch.mockResolvedValue({ status: 200 });
      axios.put.mockResolvedValue({ status: 200 });
      axios.post.mockResolvedValue({ data: 'some-url' });
    });

    it('should make request with conversation id and message id', async done => {
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(axios.post).toHaveBeenCalledWith(
        `${config.ehrRepoUrl}/health-record/${conversationId}/message`,
        expect.objectContaining({
          messageId
        })
      );
      done();
    });

    it('should make put request using the url from the response body', async done => {
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(axios.put).toHaveBeenCalledWith('some-url', message);
      done();
    });

    it('should make patch request to ehr repo service with transfer complete flag', async done => {
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(
        axios.patch
      ).toHaveBeenCalledWith(
        `${config.ehrRepoUrl}/health-record/${conversationId}/message/${messageId}`,
        { transferComplete: true }
      );
      done();
    });

    it('should not make patch request to ehr repo service when storing message fails', async done => {
      axios.put.mockRejectedValue('some-error');
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.patch).toHaveBeenCalledTimes(0);
      expect(updateLogEvent).not.toHaveBeenCalledWith({
        status: 'failed to store message to s3 via pre-signed url',
        error: expect.anything()
      });
      done();
    });

    it('should update the log event when the transfer has completed successfully', async done => {
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(updateLogEvent).toHaveBeenCalledWith({
        ehrRepository: { transferSuccessful: true }
      });
      done();
    });

    it('should update the log event when the transfer has not completed successfully', async done => {
      axios.put.mockRejectedValue({ stack: 'some-error' });
      await storeMessageInEhrRepo(message, { conversationId, messageId });
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

      done();
    });
  });
});
