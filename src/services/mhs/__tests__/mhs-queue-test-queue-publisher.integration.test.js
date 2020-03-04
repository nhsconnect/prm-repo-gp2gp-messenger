import config from '../../../config';
import { connectToQueue } from '../../../config/queue';
import { generateEhrExtractResponse } from '../../../templates/soap/ehr-extract-template';
import { sendToQueue } from '../mhs-queue-test-queue-publisher';

jest.unmock('stompit');

const originalConfig = { ...config };

describe('mhs-queue-test-helper', () => {
  const queueConsumer = () =>
    new Promise((resolve, reject) => {
      const subscribeCallback = client => (err, message) =>
        message.readString('utf-8', (error, body) => {
          if (error) {
            reject(error);
          }
          client.ack(message);
          client.disconnect();
          resolve(body);
        });

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

  describe('TestQueuePublisher', () => {
    it('should put a message on the queue that can then be consumed', async done => {
      await sendToQueue(generateEhrExtractResponse());
      const message = await queueConsumer();
      expect(message).toEqual(generateEhrExtractResponse());
      done();
    });
  });
});
