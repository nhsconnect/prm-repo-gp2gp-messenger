import { connectToQueue } from '../';
import config from '../../../config';
import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError,
  withContext
} from '../../../middleware/logging';
import { handleMessage } from './';

const onMessageCallback = (client, message, { reject }) => async (err, body) => {
  if (err) {
    updateLogEventWithError(err);
    eventFinished();
    reject(err);
    return;
  }

  try {
    await handleMessage(body);
    updateLogEvent({ status: 'Acknowledging Message', queue: { mqMessageId: message.id } });
    client.ack(message);
  } catch (err) {
    updateLogEventWithError(err);

    client.ack(message);
    reject(err);
  } finally {
    updateLogEvent({ status: 'Message Handled' });
    eventFinished();
  }
};

const subscribeCallback = (client, { resolve, reject }) => (err, message) => {
  withContext(() => {
    updateLogEvent({ status: 'Consuming received message' });

    if (err) {
      updateLogEventWithError(err);
      if (!message) throw err;
      eventFinished();
      reject(err);
      return;
    }
    message.readString('UTF-8', onMessageCallback(client, message, { resolve, reject }));
  });
};

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
