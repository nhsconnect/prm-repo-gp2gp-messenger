import { ConnectFailover } from 'stompit';
import logger from '../config/logging';
import config from '../config';
import { generateEhrExtractResponse } from '../templates/ehr-extract-template';
import { generateFirstFragmentResponse } from '../templates/fragment-1-template';
import { generateSecondFragmentResponse } from '../templates/fragment-2-template';
import { generateThirdFragmentResponse } from '../templates/fragment-3-template';
import { generateAcknowledgementResponse } from '../templates/ack-template';
import { updateLogEvent } from '../middleware/logging';

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

const putResponseOnQueue = (client, response) => {
  const frame = client.send({ destination: config.queueName });
  frame.write(response);
  frame.end();
};

export const sendMessage = () =>
  new Promise((resolve, reject) => {
    const queue = new ConnectFailover(
      [generateQueueConfig(config.queueUrl1), generateQueueConfig(config.queueUrl2)],
      { maxReconnects: 10 }
    );

    queue.on('error', error =>
      logger.debug(`There was an error when connecting to the queue broker: ${error.message}`)
    );

    queue.connect((err, client) => {
      if (err) {
        updateLogEvent({ mhs: { status: 'connection-failed' } });
        return reject(err);
      }

      putResponseOnQueue(client, generateEhrExtractResponse());
      putResponseOnQueue(client, generateFirstFragmentResponse());
      putResponseOnQueue(client, generateSecondFragmentResponse());
      putResponseOnQueue(client, generateThirdFragmentResponse());
      putResponseOnQueue(client, generateAcknowledgementResponse());

      resolve();
      client.disconnect();
    });
  });

export const getRoutingInformation = odsCode => Promise.resolve({ asid: `asid-${odsCode}` });
