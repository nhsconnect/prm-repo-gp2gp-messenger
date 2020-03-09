import config from '../../../config';
import { connectToQueue } from '../../../config/queue';
import { generateEhrExtractResponse } from '../../../templates/soap/ehr-extract-template';
import { clearQueue, sendToQueue } from '../mhs-queue-test-queue-publisher';

jest.unmock('stompit');

describe('mhs-queue-test-helper', () => {
  const queueConsumer = () =>
    new Promise((resolve, reject) => {
      const subscribeCallback = client => (err, message) => {
        message.readString('utf-8', (error, body) => {
          if (error) {
            reject(error);
          }
          client.ack(message);
          resolve(body);
        });
      };

      connectToQueue((error, client) => {
        if (error) {
          reject(error);
        }
        client.subscribe(
          { destination: config.queueName, ack: 'client-individual' },
          subscribeCallback(client)
        );
      });
    });

  afterEach(async () => {
    await clearQueue();
  });

  describe('sendToQueue', () => {
    it('should put a message on the queue that can then be consumed', async done => {
      await sendToQueue(generateEhrExtractResponse());
      const message = await queueConsumer();
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
        setTimeout(async () => {
          const message = await queueConsumer();
          expect(message).toEqual({});
          done();
        }, 100);
      });
    });
  });
});
