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

const initialiseConsumer = () => {
  const queue = new ConnectFailover([
    generateQueueConfig(config.queueUrl1),
    generateQueueConfig(config.queueUrl2)
  ]);
  queue.on('error', error =>
    logger.debug(`There was an error when connecting to the queue broker: ${error.message}`)
  );

  queue.connect((err, client) => {
    if (err) throw err;

    client.subscribe({ destination: config.queueName }, (err, msg) => {
      if (err) throw err;

      msg.readString('UTF-8', (err, body) => {
        if (err) throw err;
        handleMessage(body).catch(err =>
          logger.error('Error occurred when consuming message', err)
        );
      });
    });
  });
};

export default initialiseConsumer;
