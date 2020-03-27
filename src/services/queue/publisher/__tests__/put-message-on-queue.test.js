import config from '../../../../config';
import { mockClient, mockStream, mockTransaction } from '../../../../__mocks__/stompit';
import { putMessageOnQueue } from '../put-message-on-queue';

const MOCK_MESSAGE = 'message';
const MOCK_QUEUE_NAME = 'mocked-queue-name';

describe('putMessageOnQueue', () => {
  beforeEach(() => {
    config.queueName = MOCK_QUEUE_NAME;
  });

  afterEach(() => {
    config.queueName = MOCK_QUEUE_NAME;
  });

  it('should call client.begin once', () => {
    putMessageOnQueue(mockClient, MOCK_MESSAGE);
    expect(mockClient.begin).toHaveBeenCalledTimes(1);
  });

  it('should call transaction.send with options if passed in', () => {
    const mockOptions = { destination: 'another-queue-name' };
    putMessageOnQueue(mockClient, MOCK_MESSAGE, mockOptions);
    expect(mockTransaction.send).toHaveBeenCalledTimes(1);
    expect(mockTransaction.send).toHaveBeenCalledWith(expect.objectContaining(mockOptions));
  });

  it('should call stream.write with message', () => {
    putMessageOnQueue(mockClient, MOCK_MESSAGE);
    expect(mockStream.write).toHaveBeenCalledTimes(1);
    expect(mockStream.write).toHaveBeenCalledWith(MOCK_MESSAGE);
  });

  it('should call stream.end', () => {
    putMessageOnQueue(mockClient, MOCK_MESSAGE);
    expect(mockStream.end).toHaveBeenCalledTimes(1);
  });

  it('should call transaction.send', () => {
    putMessageOnQueue(mockClient, MOCK_MESSAGE);
    expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
  });
});
