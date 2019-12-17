import { ConnectFailover } from 'stompit';
import config from '../config';
import logger from '../config/logging';
import handleMessage from './message-handler';
import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError,
  withContext
} from '../middleware/logging';
import { getCorrelationId } from '../middleware/correlation';

const generateQueueConfig = url => {
  const urlParts = url.match(/(.*):\/\/(.*):(.*)/);
  if (!urlParts || urlParts.length < 4)
    throw new Error('Queue url should have the format protocol://host:port');

  const connectionConfig = {
    host: urlParts[2],
    port: urlParts[3],
    ssl: urlParts[1].includes('ssl'),
    connectHeaders: {
      login: config.queueUsername,
      passcode: config.queuePassword
    }
  };
  if (config.stompVirtualHost) {
    connectionConfig.connectHeaders.host = config.stompVirtualHost;
  }
  return connectionConfig;
};

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
  const hosts = [generateQueueConfig(config.queueUrl1)];
  if (config.queueUrl2) {
    hosts.push(generateQueueConfig(config.queueUrl2));
  }
  const queue = new ConnectFailover(hosts, { maxReconnects: 10, initialReconnectDelay: 100 });

  queue.on('error', error =>
    logger.debug(`Failover url could not connect to the queue broker: ${error.message}`)
  );

  queue.connect((err, client) => {
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
