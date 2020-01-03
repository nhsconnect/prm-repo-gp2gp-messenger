import config from '../config';
import handleMessage from './message-handler';
import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError,
  withContext
} from '../middleware/logging';
import { getCorrelationId } from '../middleware/correlation';
import { connectToQueue } from '../config/queue';

const sendMessageToDlq = (client, body, error) => {
  updateLogEvent({ status: 'message-sent-to-dlq' });

  const frame = client.send({
    destination: config.dlqName,
    errorMessage: error.message,
    stackTrace: error.stack,
    correlationId: getCorrelationId()
  });
  frame.write(body);
  frame.end();
};

const streamMessageToDlq = (client, msg, error) => {
  updateLogEvent({ status: 'message-sent-to-dlq' });

  const frame = client.send({
    destination: config.dlqName,
    errorMessage: error.message,
    stackTrace: error.stack,
    correlationId: getCorrelationId()
  });
  msg.pipe(frame);
};

const initialiseConsumer = () => {
  connectToQueue((err, client) => {
    if (err) throw err;

    client.subscribe({ destination: config.queueName }, (err, message) => {
      withContext(() => {
        updateLogEvent({ status: 'consuming-message' });

        if (err) {
          updateLogEventWithError(err);
          if (!message) throw err;
          streamMessageToDlq(client, message, err);
          eventFinished();
          return;
        }

        message.readString('UTF-8', (err, body) => {
          if (err) {
            updateLogEventWithError(err);
            body ? sendMessageToDlq(client, body, err) : streamMessageToDlq(client, message, err);
            eventFinished();
            return;
          }

          handleMessage(body)
            .then(() => {
              message.ack();
              updateLogEvent({ status: 'message-handled' });
            })
            .catch(err => {
              updateLogEventWithError(err);
              sendMessageToDlq(client, body, err);
              message.nack();
            })
            .finally(eventFinished);
        });
      });
    });
  });
};

export default initialiseConsumer;
