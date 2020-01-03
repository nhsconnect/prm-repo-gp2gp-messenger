import { ConnectFailover } from 'stompit';
import config from './index';
import logger from './logging';

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
      passcode: config.queuePassword,
      host: config.stompVirtualHost
    }
  };
};

export const connectToQueue = callback => {
  const hosts = [
    generateQueueConfig(config.queueUrl1),
    ...(config.queueUrl2 && [generateQueueConfig(config.queueUrl2)])
  ];
  const queue = new ConnectFailover(hosts, { maxReconnects: 10, initialReconnectDelay: 100 });

  queue.on('error', error =>
    logger.error(`Failover url could not connect to the queue broker: ${error}`, error)
  );

  queue.connect(callback);
};
