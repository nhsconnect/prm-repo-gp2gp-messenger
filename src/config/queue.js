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
      host: config.queueVirtualHost
    }
  };
};

const removePasscode = options => {
  return {
    ...options,
    connectHeaders: {
      ...options.connectHeaders,
      passcode: '*****'
    }
  };
};

const connectToQueueCallback = (resolve, reject) => (err, client) => {
  if (err) {
    resolve({
      options: removePasscode(generateQueueConfig(config.queueUrls[0])),
      headers: {},
      connected: false,
      error: err
    });
  } else {
    client.disconnect();
    resolve({
      options: removePasscode(client._options),
      headers: client.headers,
      connected: true
    });
  }
  reject(err);
};

export const checkMHSHealth = () => {
  return new Promise((resolve, reject) => {
    connectToQueue(connectToQueueCallback(resolve, reject));
  });
};

export const connectToQueue = callback => {
  const hosts = [
    generateQueueConfig(config.queueUrls[0]),
    ...(config.queueUrls[1] && [generateQueueConfig(config.queueUrls[1])])
  ];
  const queue = new ConnectFailover(hosts, { maxReconnects: 1, initialReconnectDelay: 100 });
  queue.on('error', error => {
    logger.error(`Failover url could not connect to the queue broker: ${error}`, error);
  });
  queue.connect(callback);
};
