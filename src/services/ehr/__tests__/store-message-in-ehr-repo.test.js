import axios from 'axios';
import { initializeConfig } from '../../../config';
import { logEvent, logError } from '../../../middleware/logging';
import { storeMessageInEhrRepo } from '../store-message-in-ehr-repo';

jest.mock('axios');
jest.mock('../../../config');
jest.mock('../../../middleware/logging');

describe('storeMessageInEhrRepo', () => {
  const message = 'some-message';
  const conversationId = 'some-conversation-id';
  const messageId = 'some-message-id';
  const manifest = [];
  const mockEhrRepoUrl = 'https://ehr-repo-url';
  initializeConfig.mockReturnValue({ ehrRepoUrl: mockEhrRepoUrl });

  beforeEach(() => {
    axios.patch.mockResolvedValue({ status: 200 });
    axios.put.mockResolvedValue({ status: 200 });
    axios.post.mockResolvedValue({ data: 'some-url' });
  });

  describe('get pre-signed url from EHR Repository', () => {
    it('should make request with conversation id, manifest (array of messageIds) and message id', async done => {
      await storeMessageInEhrRepo(message, { conversationId, messageId, manifest });
      expect(axios.post).toHaveBeenCalledWith(
        `${mockEhrRepoUrl}/fragments`,
        expect.objectContaining({
          messageId,
          conversationId,
          manifest
        }),
        expect.anything()
      );
      done();
    });

    it('should make a request with manifest being an array of messageIds', async done => {
      const noNhsNumber = `<eb:Body></eb:Body>`;
      await storeMessageInEhrRepo(noNhsNumber, {
        conversationId,
        messageId,
        manifest
      });
      expect(axios.post).toHaveBeenCalledWith(
        `${mockEhrRepoUrl}/fragments`,
        expect.not.objectContaining({ nhsNumber: undefined }),
        expect.anything()
      );
      done();
    });
  });

  describe('upload artifact to S3 using pre-signed URL', () => {
    it('should make put request using the url from the response body', async done => {
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(axios.put).toHaveBeenCalledWith('some-url', message);
      done();
    });

    it('should update the log event when the transfer has not completed successfully', async done => {
      axios.put.mockRejectedValue({ stack: 'some-error' });
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(logEvent).toHaveBeenCalledWith('Storing EHR in s3 bucket', {
        ehrRepository: { url: 'some-url' }
      });

      expect(logError).toHaveBeenCalledWith('failed to store message to s3 via pre-signed url', {
        error: 'some-error'
      });

      expect(logError).toHaveBeenCalledWith('failed to store message to ehr repository', {
        error: 'some-error'
      });

      done();
    });

    it('should not make patch request to ehr repo service when storing message fails', async done => {
      axios.put.mockRejectedValue('some-error');
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.patch).toHaveBeenCalledTimes(0);
      expect(logError).toHaveBeenCalledWith(
        'failed to store message to s3 via pre-signed url',
        expect.anything()
      );
      done();
    });
  });

  describe('Tell EHR Repository that transfer of fragment is complete', () => {
    it('should make patch request to ehr repo service with transfer complete flag', async done => {
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(axios.patch).toHaveBeenCalledWith(
        `${mockEhrRepoUrl}/fragments`,
        {
          conversationId,
          transferComplete: true
        },
        expect.anything()
      );
      done();
    });
  });

  it('should update the log event when the transfer has completed successfully', async done => {
    await storeMessageInEhrRepo(message, { conversationId, messageId });
    expect(logEvent).toHaveBeenCalledWith('setTransferComplete success', {
      ehrRepository: { transferSuccessful: true }
    });
    done();
  });
});
