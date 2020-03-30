import config from '../../../../config';
import { updateLogEvent } from '../../../../middleware/logging';
import { sendToQueue } from '../../publisher/send-to-queue';
import { DefaultMessage } from '../default-message';

const originalConfig = { ...config };
const mockedUnhandledMessageQueueName = 'mockedUnhandledMessageQueueName';

jest.mock('../../publisher/send-to-queue');
jest.mock('../../../../middleware/logging', () => ({
  updateLogEvent: jest.fn()
}));

const mockMessage = 'mock-message';
const defaultMessage = new DefaultMessage();

describe('DefaultMessage', () => {
  beforeEach(async () => {
    config.unhandledMessagesQueueName = mockedUnhandledMessageQueueName;
    await defaultMessage.handleMessage(mockMessage);
  });

  afterEach(() => {
    config.unhandledMessagesQueueName = originalConfig.unhandledMessagesQueueName;
  });

  it('should return "Unhandled Message" when calling name', () => {
    expect(new DefaultMessage().name).toBe('Unhandled Message');
  });

  it('should call updateLogEvent to update parser information', async done => {
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        parser: expect.objectContaining({
          name: defaultMessage.name,
          interactionId: defaultMessage.interactionId
        })
      })
    );
    done();
  });

  it('should call sendToQueue with message', async done => {
    expect(sendToQueue).toHaveBeenCalledTimes(1);
    expect(sendToQueue).toHaveBeenCalledWith(mockMessage, expect.any(Object));
    done();
  });

  it('should call sendToQueue with mockedUnhandledMessageQueueName', async done => {
    expect(sendToQueue).toHaveBeenCalledTimes(1);
    expect(sendToQueue).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        destination: mockedUnhandledMessageQueueName
      })
    );
    done();
  });

  it('should update status to "Redirecting Message to unhandled message queue" using updateLogEvent', async done => {
    expect(updateLogEvent).toHaveBeenCalledTimes(1);
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: `Redirecting ${defaultMessage.interactionId} Message to ${mockedUnhandledMessageQueueName}`
      })
    );
    done();
  });
});
