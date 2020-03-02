import config from '../../config';
import { generateEhrExtractResponse } from '../../templates/soap/ehr-extract-template';
import { generateFirstFragmentResponse } from '../../templates/soap/fragment-1-template';
import { generateSecondFragmentResponse } from '../../templates/soap/fragment-2-template';
import { generateThirdFragmentResponse } from '../../templates/soap/fragment-3-template';
import { generateBigFragmentResponse } from '../../templates/soap/fragment-4-template';
import { generateAcknowledgementResponse } from '../../templates/soap/ack-template';
import { updateLogEvent } from '../../middleware/logging';
import {
  CONTINUE_MESSAGE_ACTION,
  EHR_REQUEST_MESSAGE_ACTION,
  extractInteractionId
} from '../message-parser';
import { connectToQueue } from '../../config/queue';

const putResponseOnQueue = (client, response) => {
  const transaction = client.begin();

  const frame = transaction.send({ destination: config.queueName });
  frame.write(response);
  frame.end();

  transaction.commit();
};

function* messageGenerator() {
  yield generateFirstFragmentResponse();
  yield generateSecondFragmentResponse();
  yield generateThirdFragmentResponse();
  yield generateBigFragmentResponse();
  yield generateAcknowledgementResponse();
}

const continueMessageResponse = messageGenerator();

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

      if (interactionId === CONTINUE_MESSAGE_ACTION) {
        putResponseOnQueue(client, continueMessageResponse.next().value);
      }

      resolve();
      client.disconnect();
    });
  });

export const getRoutingInformation = odsCode => Promise.resolve({ asid: `asid-${odsCode}` });
