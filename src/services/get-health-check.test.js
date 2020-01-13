import { getHealthCheck } from './get-health-check';
import config from '../config';
import { getExpectedResults, mockClient, mockStompit } from '../config/queue.test';
import { S3 } from 'aws-sdk';

jest.mock('stompit');
jest.mock('aws-sdk');
jest.mock('aws-sdk');
jest.mock('../config/logging');
jest.mock('../middleware/logging');

const mockOn = jest.fn();
const mockConnect = jest.fn();
const mockPutObject = jest.fn().mockImplementation((config, callback) => callback());
const mockDeleteObject = jest.fn().mockImplementation((config, callback) => callback());

describe('get-health-check', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    S3.mockImplementation(() => ({
      putObject: mockPutObject,
      deleteObject: mockDeleteObject
    }));

    mockStompit(mockOn, mockConnect);
  });

  describe('getHealthCheck', () => {
    it('should resolve when both checks are ok', () => {
      mockConnect.mockImplementation(callback => callback(false, mockClient));
      return getHealthCheck().then(result => {
        return expect(result).toStrictEqual(expectedHealthCheckBase);
      });
    });
  });
});

const expectedS3Base = isWritable => ({
  type: 's3',
  bucketName: config.awsS3BucketName,
  available: true,
  writable: isWritable
});

const expectedHealthCheckBase = {
  version: '1',
  description: 'Health of GP2GP Adapter service',
  node_env: process.env.NODE_ENV,
  details: {
    filestore: expectedS3Base(true),
    mhs: getExpectedResults(true, false)
  }
};
