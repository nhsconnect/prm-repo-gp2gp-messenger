import config from '../../../../config';
import { connectToQueue } from '../';
import { updateLogEventWithError } from '../../../../middleware/logging';

jest.unmock('stompit');
jest.mock('../../../../middleware/logging');

const originalConfig = { ...config };

describe('connectToQueue', () => {
  afterEach(() => {
    config.queueUrls = originalConfig.queueUrls;
  });

  it('should log out error message if failed to connect the test url', done => {
    config.queueUrls = ['tcp://mq-1:1234'];

    const testCallback = () => {
      expect(updateLogEventWithError).toHaveBeenCalled();
      done();
    };
    return connectToQueue(testCallback);
  });

  it('should connect to the correct queue successfully ', async done => {
    const testCallback = () => {
      expect(updateLogEventWithError).not.toHaveBeenCalled();
      done();
    };

    const client = await connectToQueue(testCallback);
    client.abort();
    done();
  });
});
