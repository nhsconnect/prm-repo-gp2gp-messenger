import { sendToQueue } from '../send-to-queue';
import { updateLogEvent, updateLogEventWithError } from '../../../../middleware/logging';
import { channelPool } from '../../helper';
import { mockChannel } from '../../../../__mocks__/stompit';
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
    expect(mockChannel.send).toHaveBeenCalledTimes(1);
    expect(mockChannel.send).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: config.queueName
      }),
      expect.anything(),
      expect.any(Function)
    );
  });

  it('should call channel.send with message', () => {
    expect(mockChannel.send).toHaveBeenCalledWith(
      expect.any(Object),
      message,
      expect.any(Function)
    );
  });

  it('should call error updateLogEvent when an error occurs in channel.send', async done => {
    const invokeError = {
      send: jest.fn().mockImplementation((options, message, callback) => callback(mockError)),
      close: jest.fn()
    };

    channelPool.channel.mockImplementation(callback => callback(null, invokeError));

    await sendToQueue(message).catch(() => {});

    expect(updateLogEventWithError).toHaveBeenCalledWith(mockError);

    done();
  });

  it('should override config.queueName when options are passed in', async done => {
    await sendToQueue(message, { destination: 'some-different-queue' }).catch(() => {});

    expect(mockChannel.send).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: 'some-different-queue'
      }),
      expect.anything(),
      expect.any(Function)
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
});
