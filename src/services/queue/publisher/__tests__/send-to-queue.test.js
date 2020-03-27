import config from '../../../../config';
import { generateEhrExtractResponse } from '../../../../templates/soap/ehr-extract-template';
import { mockClient } from '../../../../__mocks__/stompit';
import { connectToQueue } from '../../helper/connect-to-queue';
import { putMessageOnQueue } from '../put-message-on-queue';
import { sendToQueue } from '../send-to-queue';

const originalConfig = { ...config };

jest.mock('../put-message-on-queue');
jest.mock('../../helper/connect-to-queue');

const MOCK_MESSAGE = generateEhrExtractResponse();

describe('publisher', () => {
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

    connectToQueue.mockImplementation(callback => callback(false, mockClient));
  });

  describe('sendToQueue', () => {
    it('should call connectToQueue with a function', async done => {
      await sendToQueue(MOCK_MESSAGE);
      expect(connectToQueue).toHaveBeenCalledTimes(1);
      expect(connectToQueue).toHaveBeenCalledWith(expect.any(Function));
      done();
    });

    it('should call putMessageOnQueue with the client and message', async done => {
      await sendToQueue(MOCK_MESSAGE);
      expect(putMessageOnQueue).toHaveBeenCalledTimes(1);
      expect(putMessageOnQueue).toHaveBeenCalledWith(mockClient, MOCK_MESSAGE);
      done();
    });

    it('should reject with an error if there is an error when connecting to the queue', () => {
      connectToQueue.mockImplementation(callback => callback('some-connection-error', null));
      return expect(sendToQueue(MOCK_MESSAGE)).rejects.toBe('some-connection-error');
    });

    it('should call client.disconnect', async done => {
      await sendToQueue(MOCK_MESSAGE);
      expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
      done();
    });

    it('should should resolve the promise with the client', () => {
      return expect(sendToQueue(MOCK_MESSAGE)).resolves.toEqual(mockClient);
    });
  });
});
