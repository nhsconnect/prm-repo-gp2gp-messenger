import { ConnectFailover } from 'stompit';
import logger from '../config/logging';
import config from '../config';
//import MhsError from './MhsError';
import { generateEhrExtractResponse } from '../templates/ehr-extract-template';
import { generateFirstFragmentResponse } from '../templates/fragment-1-template';
import { generateSecondFragmentResponse } from '../templates/fragment-2-template';
import { generateThirdFragmentResponse } from '../templates/fragment-3-template';
import { generateAcknowledgementResponse } from '../templates/ack-template';
import { updateLogEvent } from '../middleware/logging';
import {
  CONTINUE_MESSAGE_ACTION,
  EHR_REQUEST_MESSAGE_ACTION,
  extractInteractionId
} from './message-parser';

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

export const sendMessage = message =>
  new Promise((resolve, reject) => {
    //setTimeout(() => reject(new MhsError('MHS Adaptor is not responding')), 3000);
    const queue = new ConnectFailover(
      [generateQueueConfig(config.queueUrl1), generateQueueConfig(config.queueUrl2)],
      { maxReconnects: 10 }
    );

    queue.on('error', error =>
      logger.debug(`Failover url could not connect to the queue broker: ${error.message}`)
    );

    queue.connect((err, client) => {
      if (err) {
        updateLogEvent({ mhs: { status: 'connection-failed' } });
        return reject(err);
      }

      const interactionId = extractInteractionId(message);
      updateLogEvent({ mhs: { interactionId } });

      if (interactionId === EHR_REQUEST_MESSAGE_ACTION) {
        putResponseOnQueue(client, generateEhrExtractResponse());
      }

      if (interactionId === CONTINUE_MESSAGE_ACTION) {
        putResponseOnQueue(client, generateFirstFragmentResponse());
        putResponseOnQueue(client, generateSecondFragmentResponse());
        putResponseOnQueue(client, generateThirdFragmentResponse());
        putResponseOnQueue(client, generateAcknowledgementResponse());
      }

      resolve();
      client.disconnect();
    });
  });

export const getRoutingInformation = odsCode => Promise.resolve({ asid: `asid-${odsCode}` });
