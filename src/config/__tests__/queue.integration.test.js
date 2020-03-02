import logger from '../logging';
import { connectToQueue } from '../queue';
import config from '../index';

jest.unmock('stompit');
jest.mock('../logging');

const originalConfig = { ...config };

describe('connectToQueue', () => {
  afterEach(() => {
    config.queueUrls = originalConfig.queueUrls;
  });

  it('should log out error message if failed to connect the test url', done => {
    config.queueUrls = ['tcp://mq-1:1234'];

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
