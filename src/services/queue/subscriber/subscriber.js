// TODO: RENAME FILE TO INITIALISE-CONSUMER
// TODO: Remove notes
import { connectToQueue } from '../';
import config from '../../../config';
import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError,
  withContext
} from '../../../middleware/logging';
import handleMessage from './message-handler';

// Transactions
// client.begin([headers])
// transaction.send(headers, [options])
// transaction.commit([options])
// option: onReceipt get confirmation from the server that this transaction was successfully committed.
// The server may terminate the connection with an error frame if it cannot commit the transaction. In this case, an error event would be emitted from the client object.
// transaction.abort([options])

// BELOW should be moved out into another file?
// Refactor instead of passing down reject?
const onMessageCallback = (client, message, { reject }) => async (err, body) => {
  if (err) {
    updateLogEventWithError(err);
    eventFinished();
    reject(err);
    return;
  }

  try {
    await handleMessage(body);
    updateLogEvent({ status: 'Acknowledging Message', mhs: { mqMessageId: message.id } });
    client.ack(message); // Acknowledges - removes from queue
    updateLogEvent({ status: 'Message Handled' });
  } catch (err) {
    updateLogEventWithError(err);
    client.ack(message);
    reject(err);
  } finally {
    eventFinished();
  }
};

const subscribeCallback = (client, { reject }) => (err, message) => {
  withContext(() => {
    updateLogEvent({ status: 'Consuming received message' });

    if (err) {
      updateLogEventWithError(err);
      if (!message) throw err; // not sure if this needed?
      eventFinished();
      reject(err);
      return;
    }
    message.readString('UTF-8', onMessageCallback(client, message, { reject }));
  });
};

// should be configurable - pass in queueName?
// should also pass in message callback?
const initialiseSubscriber = () =>
  new Promise((resolve, reject) => {
    connectToQueue((err, client) => {
      if (err) {
        updateLogEventWithError(err);
        reject(err);
      }

      updateLogEvent({ status: 'Subscribing to MQ', mhs: { queue: config.queueName } });
      // client.subscribe(headers, onMessageCallback)
      // onMessageCallback(error, message)
      // message<T extends stream.Readable>
      client.subscribe(
        { destination: config.queueName, ack: 'client-individual' },
        subscribeCallback(client, { resolve, reject })
      );

      resolve(client);
    });
  });

export { initialiseSubscriber };
