import { connect } from 'stompit';
import config from '../../../../config';
import { generateEhrExtractResponse } from '../../../../templates/soap/ehr-extract-template';
import { sendToQueue } from '../../mhs-queue-test-queue-publisher';
import { consumeOneMessage } from '../consume-one-message';
const originalConfig = { ...config };

describe('consumeOneMessage', () => {
  afterEach(() => {
    config.queueUrls = originalConfig.queueUrls;
    config.queueUsername = originalConfig.queueUsername;
    config.queueName = originalConfig.queueName;
    config.queuePassword = originalConfig.queuePassword;
    config.queueVirtualHost = originalConfig.queueVirtualHost;
  });

  beforeEach(() => {
    config.queueUrls = ['tcp://localhost:61620', 'tcp://localhost:61621'];
    config.queueUsername = 'guest';
    config.queuePassword = 'guest';
    config.queueVirtualHost = '/';
    config.queueName = 'gp2gp-test';
  });

  it('should consume a message from the queue', async done => {
    await sendToQueue(generateEhrExtractResponse());
    const message = await consumeOneMessage();
    expect(message).toEqual({});
    done();
  });

  it('should return an error if client is unable to connect', async done => {
    await sendToQueue(generateEhrExtractResponse());
    connect.mockImplementation(callback => callback('some-connection-error', null));
    expect(consumeOneMessage()).rejects.toBe('some-connection-error');
    done();
  });
});
