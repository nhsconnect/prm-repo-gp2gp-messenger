import config from '../';

const generateQueueConfig = url => {
  const urlParts = url.match(/(.*):\/\/(.*):(.*)/);
  if (!urlParts) throw new Error(`Queue url ${url} should have the format protocol://host:port`);

  return {
    host: urlParts[2],
    port: urlParts[3],
    ssl: urlParts[1].includes('ssl'),
    login: config.queueUsername,
    passcode: config.queuePassword,
    virtualHost: config.queueVirtualHost
  };
};

// config -> stompit

export { generateQueueConfig };
