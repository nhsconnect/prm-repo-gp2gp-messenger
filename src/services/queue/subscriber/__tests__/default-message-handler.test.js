import config from '../../../../config';
import { updateLogEvent } from '../../../../middleware/logging';
import { sendToQueue } from '../../publisher/send-to-queue';
import { DefaultMessage } from '../default-message-handler';

const originalConfig = { ...config };
const mockedUnhandledMessageQueueName = 'mockedUnhandledMessageQueueName';

jest.mock('../../publisher/send-to-queue');
jest.mock('../../../../middleware/logging', () => ({
  updateLogEvent: jest.fn()
}));

describe('DefaultMessage', () => {
  beforeEach(() => {
    config.unhandledMessagesQueueName = mockedUnhandledMessageQueueName;
  });

  afterEach(() => {
    config.unhandledMessagesQueueName = originalConfig.unhandledMessagesQueueName;
  });

  it('should return "Unhandled Message" when calling name', () => {
    expect(new DefaultMessage().name).toBe('Unhandled Message');
  });

  describe('handleMessage', () => {
    it('should call sendToQueue with message', async done => {
      const message = 'message';
      await new DefaultMessage().handleMessage(message);
      expect(sendToQueue).toHaveBeenCalledTimes(1);
      expect(sendToQueue).toHaveBeenCalledWith(message, expect.any(Object));
      done();
    });

    it('should call sendToQueue with mockedUnhandledMessageQueueName', async done => {
      await new DefaultMessage().handleMessage('message');
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
      await new DefaultMessage().handleMessage('message');
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Redirecting Message to unhandled message queue'
        })
      );
      done();
    });
  });
});
