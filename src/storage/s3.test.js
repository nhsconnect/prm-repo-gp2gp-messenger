import { Endpoint, S3 } from 'aws-sdk';
import config from '../config';
import { updateLogEvent } from '../middleware/logging';
import S3Service from './s3';

jest.mock('aws-sdk');
jest.mock('../config/logging');
jest.mock('../middleware/logging');

describe('s3', () => {
  const conversationId = 'some-conversation-id';
  const messageId = 'some-message-id';
  const data = 'some-data';
  const error = 'some-error';

  let s3Service;
  const mockPutObject = jest.fn().mockImplementation((config, callback) => callback());
  const mockDeleteObject = jest.fn().mockImplementation((config, callback) => callback());

  beforeAll(() => {
    S3.mockImplementation(() => ({
      putObject: mockPutObject,
      deleteObject: mockDeleteObject
    }));

    s3Service = new S3Service(conversationId, messageId);
  });

  it('should construct the s3 service without config when is not local', () => {
    config.isLocal = false;

    new S3Service(conversationId, messageId);
    expect(S3).toHaveBeenCalledWith({});
  });

  it('should construct the s3 service with config when is local', () => {
    config.isLocal = true;

    new S3Service(conversationId, messageId);
    expect(S3).toHaveBeenCalledWith({
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      endpoint: new Endpoint('http://localstack:4572'),
      s3ForcePathStyle: true
    });
  });

  describe('save', () => {
    it('should call s3 putObject with parameters', () => {
      return s3Service.save(data).then(() => {
        const parameters = {
          Bucket: config.awsS3BucketName,
          Key: `${conversationId}/${messageId}`,
          Body: data
        };
        expect(mockPutObject).toHaveBeenCalledWith(parameters, expect.anything());
      });
    });

    it('should update the log event on success', () => {
      return s3Service.save(data).then(() => {
        expect(updateLogEvent).toHaveBeenCalledWith({
          storage: { path: `${config.awsS3BucketName}/${conversationId}/${messageId}` }
        });
      });
    });

    it('should reject the promise if s3 returns an error', () => {
      mockPutObject.mockImplementation((config, callback) => callback(error));

      return expect(s3Service.save(data)).rejects.toEqual(error);
    });
  });

  describe('delete', () => {
    it('should call s3 deleteObject with parameters', () => {
      return s3Service.remove().then(() => {
        const parameters = {
          Bucket: config.awsS3BucketName,
          Key: `${conversationId}/${messageId}`
        };
        expect(mockDeleteObject).toHaveBeenCalledWith(parameters, expect.anything());
      });
    });

    it('should update the log event on success', () => {
      return s3Service.remove().then(() => {
        expect(updateLogEvent).toHaveBeenCalledWith({
          storage: { removed: true }
        });
      });
    });

    it('should reject the promise if s3 returns an error', () => {
      mockDeleteObject.mockImplementation((config, callback) => callback(error));

      return expect(s3Service.remove()).rejects.toEqual(error);
    });
  });
});
