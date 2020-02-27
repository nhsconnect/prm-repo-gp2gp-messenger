import logger from '../logging';
import { connectToQueue } from '../queue';
import config from '../index';

jest.mock('../logging');

describe('connectToQueue', () => {
  afterEach(() => {
    config.queueUrl1 = process.env.MHS_QUEUE_URL_1;
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
