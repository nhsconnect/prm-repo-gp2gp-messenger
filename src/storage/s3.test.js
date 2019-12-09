import { S3 } from 'aws-sdk';
import save from './s3';
import config from '../config';

jest.mock('aws-sdk');
jest.mock('../config/logging');

describe('save', () => {
  it('should call s3 putObject with parameters', () => {
    const mockPutObject = jest.fn().mockImplementation((config, callback) => callback());
    S3.mockImplementation(() => ({
      putObject: mockPutObject
    }));

    save('some-data', 'some-conversation-id', 'some-message-id');

    const parameters = {
      Bucket: config.awsS3BucketName,
      Key: 'some-conversation-id/some-message-id',
      Body: 'some-data'
    };
    expect(mockPutObject).toHaveBeenCalledWith(parameters, expect.anything());
  });
});
