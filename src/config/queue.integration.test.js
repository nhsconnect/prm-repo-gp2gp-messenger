import logger from './logging';
import { connectToQueue } from './queue';
import config from './index';

jest.mock('./logging', () => ({
  warn: jest.fn(),
  error: jest.fn()
}));

describe('connectToQueue', () => {
  afterEach(() => {
    config.queueUrl1 = process.env.MHS_QUEUE_URL_1;
    jest.clearAllMocks();
  });

  it('should log out error message if failed to connect the test url', done => {
    config.queueUrl1 = 'tcp://mq-1:1234';

    const testCallback = () => {
      expect(logger.error).toHaveBeenCalled();
      done();
    };
    return connectToQueue(testCallback);
  });

  it('should connect to the correct queue successfully ', done => {
    const testCallback = () => {
      expect(logger.error).not.toHaveBeenCalled();
      done();
    };
    return connectToQueue(testCallback);
  });
});
