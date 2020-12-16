import { logEvent, logError } from '../../../../middleware/logging';
import { mockChannel, mockTransaction } from '../../../../__mocks__/stompit';
import { channelPool } from '../../helper';
import { sendToQueue } from '../send-to-queue';

jest.mock('../../../../middleware/logging');
jest.mock('../../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    queueName: 'mocked-queue-name',
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613']
  })
}));

describe('sendToQueue', () => {
  const mockError = new Error('some-send-to-queue-error');
  const mockQueueName = 'mocked-queue-name';
  const message = 'some-message';

  afterEach(() => {
    channelPool.channel.mockImplementation(callback => callback(null, mockChannel));
    mockTransaction.commit.mockImplementation(callback => callback(null));
  });

  describe('on success', () => {
    beforeEach(async () => {
      await sendToQueue(message).catch(() => {});
    });

    it('should call logEvent with "Sending message to Queue"', () => {
      expect(logEvent).toHaveBeenCalledWith('Sending Message to Queue');
    });

    it('should call channelPool.channel', () => {
      expect(channelPool.channel).toHaveBeenCalledTimes(1);
    });

    it('should call channel.send', () => {
      expect(mockChannel.begin).toHaveBeenCalledTimes(1);
      expect(mockChannel.begin).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: mockQueueName
        })
      );
    });

    it('should call channel.send', () => {
      expect(mockTransaction.send).toHaveBeenCalledTimes(1);
      expect(mockTransaction.send).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: mockQueueName
        }),
        expect.anything()
      );
    });

    it('should call channel.send with message', () => {
      expect(mockTransaction.send).toHaveBeenCalledWith(expect.any(Object), message);
    });

    it('should override config.queueName when options are passed in', async done => {
      await sendToQueue(message, { destination: 'some-different-queue' }).catch(() => {});

      expect(mockChannel.begin).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: 'some-different-queue'
        })
      );

      expect(mockTransaction.send).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: 'some-different-queue'
        }),
        message
      );

      done();
    });

    it('should close the channel if error not thrown', () => {
      expect(mockChannel.close).toHaveBeenCalledTimes(1);
    });

    it('should logEvent when message has been sent successfully', () => {
      expect(logEvent).toHaveBeenCalledWith('Sent Message Successfully');
    });
  });

  describe('on error', () => {
    it('should call logError if an error is passed into callback', async done => {
      channelPool.channel.mockImplementation(callback => callback(mockError));
      await sendToQueue().catch(() => {});
      expect(logError).toHaveBeenCalledTimes(1);
      expect(logError).toHaveBeenCalledWith('sendToQueue error', mockError);
      done();
    });

    it('should call transaction.abort if commit fails', async done => {
      mockTransaction.commit.mockImplementation(callback => callback(mockError));
      await sendToQueue(message).catch(() => {});
      expect(mockTransaction.abort).toHaveBeenCalledTimes(1);
      done();
    });

    it('should reject if commit fails', () => {
      mockTransaction.commit.mockImplementation(callback => callback(mockError));
      return expect(sendToQueue(message)).rejects.toEqual(mockError);
    });

    it('should call logError if commit fails', async done => {
      mockTransaction.commit.mockImplementation(callback => callback(mockError));
      await sendToQueue(message).catch(() => {});
      expect(logError).toHaveBeenCalledWith(mockError);
      done();
    });
  });
});
