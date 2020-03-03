import aqmp from 'amqplib';
import config from '../../config';
import { generateQueueConfig } from '../../config/utils/generate-queue-config';

class TestQueuePublisher {
  constructor() {
    this.client = this._connect();
  }

  async isConnected() {
    const _client = await this.client;
    if (!_client) return false;
    return _client.connection.stream.readable && _client.connection.stream.writable;
  }

  _connect() {
    const queueConfig = generateQueueConfig(config.testQueueUrl);
    return aqmp
      .connect({ protocol: 'amqp', ...queueConfig })
      .then(connection => {
        return connection.createConfirmChannel(config.queueName);
      })
      .catch(err => {
        console.log(err);
        return 'ERROR';
      });
  }

  async disconnect() {
    const _client = await this.client;
    this.client = await _client.close();
    return;
  }
}

export { TestQueuePublisher };
