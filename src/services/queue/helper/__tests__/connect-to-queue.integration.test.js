import { connectToQueue } from '../';
import { logError } from '../../../../middleware/logging';

jest.unmock('stompit');
jest.mock('../../../../middleware/logging');
jest.mock('../../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    queueUrls: ['tcp://mq-1:1234']
  })
}));

describe('connectToQueue', () => {
  it('should log out error message if failed to connect the test url', done => {
    const testCallback = () => {
      expect(logError).toHaveBeenCalled();
      done();
    };
    return connectToQueue(testCallback);
  });

  it('should connect to the correct queue successfully ', async done => {
    const testCallback = () => {
      expect(logError).not.toHaveBeenCalled();
      done();
    };

    const client = await connectToQueue(testCallback);
    client.abort();
    done();
  });
});
