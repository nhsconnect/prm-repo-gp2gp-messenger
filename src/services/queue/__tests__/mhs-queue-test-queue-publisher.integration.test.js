import { generateEhrExtractResponse } from '../../../templates/soap/ehr-extract-template';
import { clearQueue, consumeOneMessage } from '../helper';
import { sendToQueue } from '../mhs-queue-test-queue-publisher';

jest.unmock('stompit');

describe('sendToQueue', () => {
  afterEach(async () => {
    await clearQueue();
  });

  it('should put a message on the queue that can then be consumed', async done => {
    await sendToQueue(generateEhrExtractResponse());
    const message = await consumeOneMessage();
    expect(message).toEqual(generateEhrExtractResponse());
    done();
  });
});
