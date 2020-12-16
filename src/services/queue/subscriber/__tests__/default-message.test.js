import { logEvent } from '../../../../middleware/logging';
import { sendToQueue } from '../../publisher';
import { DefaultMessage } from '../default-message';

jest.mock('../../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    unhandledMessagesQueueName: 'mockedUnhandledMessageQueueName',
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613']
  })
}));
jest.mock('../../publisher/send-to-queue');
jest.mock('../../../../middleware/logging');

describe('DefaultMessage', () => {
  const mockUnhandledMessagesQueueName = 'mockedUnhandledMessageQueueName';
  const mockMessage = 'mock-message';
  const defaultMessage = new DefaultMessage();

  beforeEach(async () => {
    await defaultMessage.handleMessage(mockMessage);
  });

  it('should return "Unhandled Message" when calling name', () => {
    expect(new DefaultMessage().name).toBe('Unhandled Message');
  });

  it('should call logEvent to update parser information', async done => {
    expect(logEvent).toHaveBeenCalledWith(
      'Redirecting Message to mockedUnhandledMessageQueueName',
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
        destination: mockUnhandledMessagesQueueName
      })
    );
    done();
  });

  it('should update status to "Redirecting Message to unhandled message queue" using logEvent', async done => {
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith(
      `Redirecting Message to ${mockUnhandledMessagesQueueName}`,
      expect.anything()
    );
    done();
  });
});
