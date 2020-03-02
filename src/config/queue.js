import { ConnectFailover } from 'stompit';
import logger from './logging';
import { getStompitQueueConfig } from './utils';

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
      options: removePasscode(getStompitQueueConfig()[0]),
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
  const queue = new ConnectFailover(getStompitQueueConfig(), {
    maxReconnects: 1,
    initialReconnectDelay: 100
  });
  queue.on('error', error => {
    logger.error(`Failover url could not connect to the queue broker: ${error}`, error);
  });
  queue.connect(callback);
};
