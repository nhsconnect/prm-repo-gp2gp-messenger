import { generateEhrExtractResponse } from '../../../templates/soap/ehr-extract-template';
import { consumeOneMessage } from '../helper';
import { clearQueue, sendToQueue } from '../mhs-queue-test-queue-publisher';

jest.unmock('stompit');

describe('mhs-queue-test-helper', () => {
  afterEach(async () => {
    await clearQueue();
  });

  describe('sendToQueue', () => {
    it('should put a message on the queue that can then be consumed', async done => {
      await sendToQueue(generateEhrExtractResponse());
      const message = await consumeOneMessage();
      expect(message).toEqual(generateEhrExtractResponse());
      done();
    });

    describe('clearTheQueue', () => {
      it('should clear the queue when multiple messages have been added', async done => {
        await sendToQueue('message 1');
        await sendToQueue('message 2');
        await sendToQueue('message 3');
        await sendToQueue('message 4');
        await clearQueue();
        const message = await consumeOneMessage();
        expect(message).toEqual({});
        done();
      });

      it('should not fail if queue is empty when clearing queue', async done => {
        await clearQueue();
        const message = await consumeOneMessage();
        expect(message).toEqual({});
        done();
      });
    });
  });
});
