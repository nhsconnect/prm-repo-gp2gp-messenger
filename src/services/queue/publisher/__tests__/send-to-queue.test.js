import { sendToQueue } from '../send-to-queue';
import { updateLogEvent, updateLogEventWithError } from '../../../../middleware/logging';
import { channelPool } from '../../helper';
import { mockChannel, mockTransaction } from '../../../../__mocks__/stompit';
import config from '../../../../config';
jest.mock('../../../../middleware/logging');

const mockError = new Error('some-error');
const message = 'some-message';

describe('sendToQueue', () => {
  beforeEach(async () => {
    await sendToQueue(message).catch(() => {});
  });

  afterEach(() => {
    channelPool.channel.mockImplementation(callback => callback(null, mockChannel));
    mockTransaction.commit.mockImplementation(callback => callback(null));
  });

  it('should call updateLogEvent with "Sending message to Queue"', () => {
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Sending Message to Queue'
      })
    );
  });

  it('should call channelPool.channel', () => {
    expect(channelPool.channel).toHaveBeenCalledTimes(1);
  });

  it('should call updateLogEventWithError if an error is passed into callback', async done => {
    channelPool.channel.mockImplementation(callback => callback(mockError));
    await sendToQueue().catch(() => {});
    expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
    expect(updateLogEventWithError).toHaveBeenCalledWith(mockError);
    done();
  });

  it('should call channel.send', () => {
    expect(mockChannel.begin).toHaveBeenCalledTimes(1);
    expect(mockChannel.begin).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: config.queueName
      })
    );
  });

  it('should call channel.send', () => {
    expect(mockTransaction.send).toHaveBeenCalledTimes(1);
    expect(mockTransaction.send).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: config.queueName
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

  it('should updateLogEvent when message has been sent successfully', () => {
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Sent Message Successfully'
      })
    );
  });

  it('should call transaction.abort if commit fails', () => {
    mockTransaction.commit.mockImplementation(callback => callback(mockError));
    sendToQueue(message);
    expect(mockTransaction.abort).toHaveBeenCalledTimes(1);
  });

  it('should call updateLogEventWithError if commit fails', () => {
    mockTransaction.commit.mockImplementation(callback => callback(mockError));
    sendToQueue(message);
    expect(updateLogEventWithError).toHaveBeenCalledWith(mockError);
  });
});
