import { v4 as uuid } from 'uuid';
import { consumeOneMessage } from '../';
import { sendToQueueOld } from '../../publisher';

jest.unmock('stompit');
jest.unmock('uuid');

describe('consumeOneMessage', () => {
  it('should return message from the queue', async done => {
    const mockQueueName = uuid();
    await sendToQueueOld('message 1', { destination: mockQueueName });
    const message = await consumeOneMessage({ destination: mockQueueName });
    expect(message).toEqual('message 1');
    done();
  });

  it('should return each message from the queue', async done => {
    const mockQueueName = uuid();
    await sendToQueueOld('message 1', { destination: mockQueueName });
    const message = await consumeOneMessage({ destination: mockQueueName });
    expect(message).toEqual('message 1');
    await sendToQueueOld('message 2', { destination: mockQueueName });
    const messageTwo = await consumeOneMessage({ destination: mockQueueName });
    expect(messageTwo).toEqual('message 2');
    done();
  });

  it('should return empty object if no messages on the queue', async done => {
    const mockQueueName = uuid();
    const message = await consumeOneMessage({ destination: mockQueueName });
    expect(message).toEqual({});
    done();
  });
});
