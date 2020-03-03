import { TestQueuePublisher } from '../mhs-queue-test-queue-publisher';

jest.unmock('amqplib');

describe('mhs-queue-test-helper', () => {
  describe('TestQueuePublisher', () => {
    let queuePublisher;

    beforeEach(async () => {
      queuePublisher = await new TestQueuePublisher();
    });

    afterEach(() => {});

    describe('TestQueuePublisher.isConnected', () => {
      it('should connect to the queue (using amqplib)', async done => {
        expect(await queuePublisher.isConnected()).toBe(true);
        done();
      });
    });

    describe('TestQueuePublisher.disconnect', () => {
      it('should close connection', async done => {
        expect(await queuePublisher.isConnected()).toBe(true);
        await queuePublisher.disconnect();
        expect(await queuePublisher.isConnected()).toBe(false);
        done();
      });
    });
  });
});
