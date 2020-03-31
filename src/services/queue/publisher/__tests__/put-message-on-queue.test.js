import config from '../../../../config';
import { updateLogEvent } from '../../../../middleware/logging';
import { mockClient, mockStream, mockTransaction } from '../../../../__mocks__/stompit';
import { putMessageOnQueue } from '../put-message-on-queue';

const mockMessage = 'message';
const mockQueueName = 'mocked-queue-name';

jest.mock('../../../../middleware/logging');

describe('putMessageOnQueue', () => {
  beforeEach(() => {
    config.queueName = mockQueueName;
  });

  afterEach(() => {
    config.queueName = mockQueueName;
  });

  it('should call updateLogEvent with status "Putting Message on queue"', () => {
    putMessageOnQueue(mockClient, mockMessage);
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Putting Message on queue'
      })
    );
  });

  it('should call updateLogEvent with queue options', () => {
    const mockOptions = {
      option: 'mock'
    };
    putMessageOnQueue(mockClient, mockMessage, mockOptions);
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        queue: expect.objectContaining({
          options: expect.objectContaining(mockOptions)
        })
      })
    );
  });

  it('should call client.begin once', () => {
    putMessageOnQueue(mockClient, mockMessage);
    expect(mockClient.begin).toHaveBeenCalledTimes(1);
  });

  it('should call updateLogEvent with "Send transaction"', () => {
    const mockOptions = {
      option: 'mock'
    };
    putMessageOnQueue(mockClient, mockMessage, mockOptions);
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Sending transaction'
      })
    );
  });

  it('should call updateLogEvent with transaction id', () => {
    const mockOptions = {
      option: 'mock'
    };
    putMessageOnQueue(mockClient, mockMessage, mockOptions);
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        queue: expect.objectContaining({
          transaction: expect.objectContaining({
            id: mockTransaction.id
          })
        })
      })
    );
  });

  it('should call transaction.send with options if passed in', () => {
    const mockOptions = { destination: 'another-queue-name' };
    putMessageOnQueue(mockClient, mockMessage, mockOptions);
    expect(mockTransaction.send).toHaveBeenCalledTimes(1);
    expect(mockTransaction.send).toHaveBeenCalledWith(expect.objectContaining(mockOptions));
  });

  it('should call stream.write with message', () => {
    putMessageOnQueue(mockClient, mockMessage);
    expect(mockStream.write).toHaveBeenCalledTimes(1);
    expect(mockStream.write).toHaveBeenCalledWith(mockMessage);
  });

  it('should call stream.end', () => {
    putMessageOnQueue(mockClient, mockMessage);
    expect(mockStream.end).toHaveBeenCalledTimes(1);
  });

  it('should call transaction.send', () => {
    putMessageOnQueue(mockClient, mockMessage);
    expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
  });
});
