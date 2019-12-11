import { ConnectFailover } from 'stompit';
import config from '../config';
import logger from '../config/logging';
import handleMessage from './message-handler';

const generateQueueConfig = url => {
  const urlParts = url.match(/(.*):\/\/(.*):(.*)/);
  if (!urlParts || urlParts.length < 4)
    throw new Error('Queue url should have the format protocol://host:port');

  return {
    host: urlParts[2],
    port: urlParts[3],
    ssl: urlParts[1].includes('ssl'),
    connectHeaders: {
      login: config.queueUsername,
      passcode: config.queuePassword
    }
  };
};

const sendMessageToDlq = (client, body, error) => {
  const frame = client.send({
    destination: config.dlqName,
    errorMessage: error.message,
    stackTrace: error.stack
  });
  frame.write(body);
  frame.end();
};

const streamMessageToDlq = (client, msg, error) => {
  const frame = client.send({
    destination: config.dlqName,
    errorMessage: error.message,
    stackTrace: error.stack
  });
  msg.pipe(frame);
};

const initialiseConsumer = () => {
  const queue = new ConnectFailover(
    [generateQueueConfig(config.queueUrl1), generateQueueConfig(config.queueUrl2)],
    { maxReconnects: 10 }
  );

  queue.on('error', error =>
    logger.debug(`Failover url could not connect to the queue broker: ${error.message}`)
  );

  queue.connect((err, client) => {
    if (err) throw err;

    client.subscribe({ destination: config.queueName }, (err, msg) => {
      if (err) {
        if (!msg) throw err;
        return streamMessageToDlq(client, msg, err);
      }

      msg.readString('UTF-8', (err, body) => {
        if (err) {
          return body ? sendMessageToDlq(client, body, err) : streamMessageToDlq(client, msg, err);
        }

        handleMessage(body).catch(err => sendMessageToDlq(client, body, err));
      });
    });
  });
};

export default initialiseConsumer;
