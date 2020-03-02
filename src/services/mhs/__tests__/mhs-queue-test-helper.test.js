import { TestQueuePublisher } from '../mhs-queue-test-helper';

describe('mhs-queue-test-helper', () => {
  describe('TestQueuePublisher', () => {
    it('should exist', () => {
      const testQueuePublisher = new TestQueuePublisher();
      expect(testQueuePublisher).toBeTruthy();
    });
  });
});
