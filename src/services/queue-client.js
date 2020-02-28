import config from '../config';

const generateQueueConfig = url => {
  const urlParts = url.match(/(.*):\/\/(.*):(.*)/);
  if (!urlParts) throw new Error(`Queue url ${url} should have the format protocol://host:port`);

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

const generateHostsConfig = queueUrls => {
  if (!Array.isArray(queueUrls))
    throw new Error('generateHostsConfig input must be an array of queue URLs');
  return queueUrls.map(queueUrl => generateQueueConfig(queueUrl));
};

class QueueClient {
  constructor({ name = config.queueName } = {}) {
    this.name = name;
  }
}

export { QueueClient, generateQueueConfig, generateHostsConfig };
