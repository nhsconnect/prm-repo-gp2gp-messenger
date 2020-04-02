import config from '../../../../config';
import { updateLogEvent, updateLogEventWithError } from '../../../../middleware/logging';
import { generateEhrExtractResponse } from '../../../../templates/soap/ehr-extract-template';
import { mockClient } from '../../../../__mocks__/stompit';
import { connectToQueue } from '../../helper/connect-to-queue';
import { putMessageOnQueueOld } from '../put-message-on-queue-old';
import { sendToQueueOld } from '../send-to-queue-old';

const originalConfig = { ...config };

jest.mock('../put-message-on-queue-old');
jest.mock('../../helper/connect-to-queue');
jest.mock('../../../../middleware/logging');

const MOCK_MESSAGE = generateEhrExtractResponse();
const MOCK_QUEUE_NAME = 'gp2gp-test';

describe('sendToQueue', () => {
  afterEach(() => {
    config.queueUrls = originalConfig.queueUrls;
    config.queueUsername = originalConfig.queueUsername;
    config.queueName = originalConfig.queueName;
    config.queuePassword = originalConfig.queuePassword;
    config.queueVirtualHost = originalConfig.queueVirtualHost;

    connectToQueue.mockImplementation(callback => callback(false, mockClient));
  });

  beforeEach(() => {
    config.queueUrls = ['tcp://localhost:61620', 'tcp://localhost:61621'];
    config.queueUsername = 'guest';
    config.queuePassword = 'guest';
    config.queueVirtualHost = '/';
    config.queueName = MOCK_QUEUE_NAME;
  });

  it('should should resolve the promise with the client', () => {
    return expect(sendToQueueOld(MOCK_MESSAGE)).resolves.toEqual(mockClient);
  });

  describe('on success', () => {
    beforeEach(async () => {
      await sendToQueueOld(MOCK_MESSAGE);
    });

    it('should call connectToQueue with a function', () => {
      expect(connectToQueue).toHaveBeenCalledTimes(1);
      expect(connectToQueue).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should call updateLogEvent with default queue options', () => {
      expect(updateLogEvent.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          queue: expect.objectContaining({
            options: expect.objectContaining({
              destination: config.queueName
            })
          })
        })
      );
    });

    it('should call updateLogEvent with status "Connected to the queue"', () => {
      expect(updateLogEvent.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          status: 'Connected to the queue'
        })
      );
    });

    it('should call putMessageOnQueueOld with the client', () => {
      expect(putMessageOnQueueOld).toHaveBeenCalledTimes(1);
      expect(putMessageOnQueueOld).toHaveBeenCalledWith(
        mockClient,
        expect.anything(),
        expect.anything()
      );
    });

    it('should call putMessageOnQueueOld with the message', () => {
      expect(putMessageOnQueueOld).toHaveBeenCalledTimes(1);
      expect(putMessageOnQueueOld).toHaveBeenCalledWith(
        expect.anything(),
        MOCK_MESSAGE,
        expect.anything()
      );
    });

    it('should call putMessageOnQueueOld with default options - {destination: queueName}', () => {
      expect(putMessageOnQueueOld).toHaveBeenCalledTimes(1);
      expect(putMessageOnQueueOld).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          destination: MOCK_QUEUE_NAME
        })
      );
    });

    it('should call updateLogEvent with status "Disconnecting from message client"', () => {
      expect(updateLogEvent.mock.calls[updateLogEvent.mock.calls[0].length][0]).toEqual(
        expect.objectContaining({
          status: 'Disconnecting from message client'
        })
      );
    });

    it('should call client.disconnect', () => {
      expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('passing in options', () => {
    it('should call putMessageOnQueueOld with destination that replaces default', async done => {
      const mockOptions = {
        destination: 'another-queue-destination'
      };
      await sendToQueueOld(MOCK_MESSAGE, mockOptions);
      expect(putMessageOnQueueOld).toHaveBeenCalledTimes(1);
      expect(putMessageOnQueueOld).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining(mockOptions)
      );
      done();
    });

    it('should call putMessageOnQueueOld with passed in options along with default options', async done => {
      const mockOptions = {
        anotherOption: 'another-Option'
      };
      await sendToQueueOld(MOCK_MESSAGE, mockOptions);
      expect(putMessageOnQueueOld).toHaveBeenCalledTimes(1);
      expect(putMessageOnQueueOld).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          destination: config.queueName,
          anotherOption: 'another-Option'
        })
      );
      done();
    });

    it('should call updateLogEvent with default options', async done => {
      const mockOptions = {
        anotherOption: 'another-Option'
      };
      await sendToQueueOld(MOCK_MESSAGE, mockOptions);
      expect(updateLogEvent.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          queue: expect.objectContaining({
            options: expect.objectContaining(mockOptions)
          })
        })
      );
      done();
    });
  });

  describe('on error', () => {
    it('should reject with an error if there is an error when connecting to the queue', () => {
      connectToQueue.mockImplementation(callback => callback('some-connection-error', null));
      return expect(sendToQueueOld(MOCK_MESSAGE)).rejects.toBe('some-connection-error');
    });

    it('should call updateLogEventWithError with err', async done => {
      connectToQueue.mockImplementation(callback => callback('some-connection-error', null));
      await sendToQueueOld(MOCK_MESSAGE).catch(() => {});
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith('some-connection-error');
      done();
    });
  });
});
