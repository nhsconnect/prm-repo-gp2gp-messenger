import config from '../../config';
import { connectToQueue } from '../queue';
import { updateLogEvent } from '../../middleware/logging';
import { generateEhrExtractResponse } from '../../templates/soap/ehr-extract-template';
import { extractInteractionId } from '../parser/message';

const putResponseOnQueue = (client, response) => {
  const transaction = client.begin();

  const frame = transaction.send({ destination: config.queueName });
  frame.write(response);
  frame.end();

  transaction.commit();
};

const EHR_REQUEST_MESSAGE_ACTION = 'RCMR_IN010000UK05'; // Electronic Healthcare Record Request Started (GP2GP v1.1)

export const sendMessage = message =>
  new Promise((resolve, reject) => {
    connectToQueue(async (err, client) => {
      if (err) {
        updateLogEvent({ mhs: { status: 'connection-failed' } });
        return reject(err);
      }

      const interactionId = await extractInteractionId(message);
      updateLogEvent({ mhs: { interactionId } });

      if (interactionId === EHR_REQUEST_MESSAGE_ACTION) {
        putResponseOnQueue(client, generateEhrExtractResponse());
      }

      resolve();
      client.disconnect();
    });
  });

export const getRoutingInformation = odsCode => Promise.resolve({ asid: `asid-${odsCode}` });
