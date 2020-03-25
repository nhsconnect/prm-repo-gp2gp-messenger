import config from '../config';
import { connectToQueue } from '../config/queue';
import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError,
  withContext
} from '../middleware/logging';
import handleMessage from './message-handler';

// Transactions
// client.begin([headers])
// transaction.send(headers, [options])
// transaction.commit([options])
// option: onReceipt get confirmation from the server that this transaction was successfully committed.
// The server may terminate the connection with an error frame if it cannot commit the transaction. In this case, an error event would be emitted from the client object.
// transaction.abort([options])

const onMessageCallback = (client, message) => (err, body) => {
  if (err) {
    updateLogEventWithError(err);
    eventFinished();
    return;
  }

  handleMessage(body)
    .then(() => {
      updateLogEvent({ status: 'Acknowledging Message', mhs: { mqMessageId: message.id } });
      return client.ack(message); // Acknowledges - removes from queue
    })
    .then(() => {
      updateLogEvent({ status: 'Message Handled' });
    })
    .catch(err => {
      updateLogEventWithError(err);

      // Not Acknowledges - no body
      // If you can't read message use client.destroy
      return client.nack(message);
    })
    .finally(() => eventFinished());
};

const subscribeCallback = client => (err, message) => {
  withContext(() => {
    updateLogEvent({ status: 'Consuming received message' });

    if (err) {
      updateLogEventWithError(err);
      if (!message) throw err;
      eventFinished();
      return;
    }
    message.readString('UTF-8', onMessageCallback(client, message));
  });
};

const initialiseConsumer = () => {
  connectToQueue((err, client) => {
    if (err) {
      updateLogEventWithError(err);
      throw err;
    }

    updateLogEvent({ status: 'Subscribing to MQ', mhs: { queue: config.queueName } });
    // client.subscribe(headers, onMessageCallback)
    // onMessageCallback(error, message)
    // message<T extends stream.Readable>
    client.subscribe(
      { destination: config.queueName, ack: 'client-individual' },
      subscribeCallback(client)
    );
  });
};

export { initialiseConsumer };
