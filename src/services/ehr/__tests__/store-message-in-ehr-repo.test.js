import axios from 'axios';
import config from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { storeMessageInEhrRepo } from '../store-message-in-ehr-repo';

jest.mock('axios');

jest.mock('../../../middleware/logging');

const originalEhrRepoUrl = config.ehrRepoUrl;

describe('storeMessageInEhrRepo', () => {
  const message = 'some-message';
  const conversationId = 'some-conversation-id';
  const messageId = 'some-message-id';
  const manifest = [];

  beforeEach(() => {
    config.ehrRepoUrl = 'https://ehr-repo-url';
    axios.patch.mockResolvedValue({ status: 200 });
    axios.put.mockResolvedValue({ status: 200 });
    axios.post.mockResolvedValue({ data: 'some-url' });
  });

  afterEach(() => {
    config.ehrRepoUrl = originalEhrRepoUrl;
  });

  describe('get pre-signed url from EHR Repository', () => {
    it('should make request with conversation id, manifest (array of messageIds) and message id', async done => {
      await storeMessageInEhrRepo(message, { conversationId, messageId, manifest });
      expect(axios.post).toHaveBeenCalledWith(
        `${config.ehrRepoUrl}/fragments`,
        expect.objectContaining({
          messageId,
          conversationId,
          manifest
        })
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
        `${config.ehrRepoUrl}/fragments`,
        expect.not.objectContaining({ nhsNumber: undefined })
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
  });

  describe('Tell EHR Repository that transfer of fragment is complete', () => {
    it('should make patch request to ehr repo service with transfer complete flag', async done => {
      await storeMessageInEhrRepo(message, { conversationId, messageId });
      expect(axios.patch).toHaveBeenCalledWith(`${config.ehrRepoUrl}/fragments`, {
        body: {
          conversationId,
          messageId
        },
        transferComplete: true
      });
      done();
    });
  });

  it('should update the log event when the transfer has completed successfully', async done => {
    await storeMessageInEhrRepo(message, { conversationId, messageId });
    expect(updateLogEvent).toHaveBeenCalledWith({
      ehrRepository: { transferSuccessful: true }
    });
    done();
  });
});
