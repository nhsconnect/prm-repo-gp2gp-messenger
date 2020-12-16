import { initializeConfig } from '../';

export const generateQueueConfig = url => {
  const config = initializeConfig();
  const urlParts = url.match(/(.*):\/\/(.*):(.*)/);
  if (!urlParts) throw new Error(`Queue url ${url} should have the format protocol://host:port`);

  return {
    host: urlParts[2],
    port: process.env.NHS_ENVIRONMENT ? '61614' : urlParts[3],
    ssl: urlParts[1].includes('ssl'),
    username: config.queueUsername,
    password: config.queuePassword,
    vhost: config.queueVirtualHost
  };
};
