import { ConnectFailover } from 'stompit';
import config from '../../../config';
import { getStompitQueueConfig } from '../../../config/utils/get-stompit-queue-config';
import { sendToQueue } from '../mhs-queue-test-queue-publisher';

const originalQueueUrls = { ...config.queueUrls };

describe('mhs-queue-test-queue-publisher - sendToQueue', () => {
  beforeEach(() => {
    config.queueUrls = ['tcp://localhost:61620', 'tcp://localhost:61621'];
  });

  afterEach(() => {
    config.queueUrls = originalQueueUrls;
  });

  it('should connect to a queue', async done => {
    await sendToQueue();
    expect(ConnectFailover).toHaveBeenCalledTimes(1);
    expect(ConnectFailover).toHaveBeenCalledWith(getStompitQueueConfig(), expect.anything());
    done();
  });
});
