import { getStompitQueueConfig } from '../../config/utils/get-stompit-queue-config';
import { connectToQueue } from '../queue';

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
