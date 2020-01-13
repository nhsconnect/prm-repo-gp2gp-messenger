import config from '../config';
import handleMessage from './message-handler';
import { getCorrelationId } from '../middleware/correlation';
import { connectToQueue } from '../config/queue';
import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError,
  withContext
} from '../middleware/logging';

// Transactions
// client.begin([headers])
// transaction.send(headers, [options])
// transaction.commit([options])
// option: onReceipt get confirmation from the server that this transaction was successfully committed.
// The server may terminate the connection with an error frame if it cannot commit the transaction. In this case, an error event would be emitted from the client object.
// transaction.abort([options])
const sendMessageToDlq = (client, body, error) => {
  updateLogEvent({ status: 'message-sent-to-dlq' });

  // client.send(headers, [options]) stream.Writable
  // alt = client.sendFrame(command, headers, [options]): stream.Writable
  // ack: set the message acknowledgment mode, having value 'auto', 'client' or 'client-individual'
  const transaction = client.begin();

  const frame = transaction.send(getHeaders(error));
  frame.write(body);
  frame.end();
  transaction.commit();
};

const streamMessageToDlq = (client, message, error) => {
  updateLogEvent({ status: 'message-sent-to-dlq' });
  const transaction = client.begin();
  const frame = transaction.send(getHeaders(error));
  message.pipe(frame);
  transaction.commit();
};

const getHeaders = error => {
  return {
    destination: config.dlqName,
    errorMessage: error.message,
    stackTrace: error.stack,
    correlationId: getCorrelationId()
  };
};

const onMessageCallback = (client, message) => (err, body) => {
  if (err) {
    updateLogEventWithError(err);
    body ? sendMessageToDlq(client, body, err) : streamMessageToDlq(client, message, err);
    eventFinished();
    return;
  }

  handleMessage(body)
    .then(() => {
      return client.ack(message);
    })
    .then(() => {
      updateLogEvent({ status: 'message-handled' });
    })
    .catch(err => {
      sendMessageToDlq(client, body, err);
      updateLogEventWithError(err);

      // Not Acknowledges - no body
      // If you can't read message use client.destroy
      return client.nack(message);
    })
    .finally(eventFinished);
};

const subscribeCallback = client => (err, message) => {
  withContext(() => {
    updateLogEvent({ status: 'consuming-message' });

    if (err) {
      updateLogEventWithError(err);
      if (!message) throw err;
      streamMessageToDlq(client, message, err);
      eventFinished();
      return;
    }
    message.readString('UTF-8', onMessageCallback(client, message));
  });
};

const initialiseConsumer = () => {
  connectToQueue((err, client) => {
    if (err) throw err;

    // client.subscribe(headers, onMessageCallback)
    // onMessageCallback(error, message)
    // message<T extends stream.Readable>
    client.subscribe(
      { destination: config.queueName, ack: 'client-individual' },
      subscribeCallback(client)
    );
  });
};

export default initialiseConsumer;
