import { S3 } from 'aws-sdk';
import save from './s3';
import config from '../config';
import { updateLogEvent } from '../middleware/logging';

jest.mock('aws-sdk');
jest.mock('../config/logging');
jest.mock('../middleware/logging');

describe('save', () => {
  const mockPutObject = jest.fn().mockImplementation((config, callback) => callback());
  S3.mockImplementation(() => ({
    putObject: mockPutObject
  }));

  it('should call s3 putObject with parameters', () => {
    return save('some-data', 'some-conversation-id', 'some-message-id').then(() => {
      const parameters = {
        Bucket: config.awsS3BucketName,
        Key: 'some-conversation-id/some-message-id',
        Body: 'some-data'
      };
      expect(mockPutObject).toHaveBeenCalledWith(parameters, expect.anything());
    });
  });

  it('should update the log event on success', () => {
    return save('some-data', 'some-conversation-id', 'some-message-id').then(() => {
      expect(updateLogEvent).toHaveBeenCalledWith({
        storage: { path: `${config.awsS3BucketName}/some-conversation-id/some-message-id` }
      });
    });
  });

  it('should reject the promise if s3 returns an error', () => {
    mockPutObject.mockImplementation((config, callback) => callback('some-error'));

    return expect(save('some-data', 'some-conversation-id', 'some-message-id')).rejects.toEqual(
      'some-error'
    );
  });
});
