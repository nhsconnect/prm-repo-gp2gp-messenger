import { logEvent } from '../../middleware/logging';
import { generateEhrExtractResponse } from '../../templates/soap/ehr-extract-template';
import { extractInteractionId } from '../parser/message';
import { channelPool, sendToQueue } from '../queue';

const EHR_REQUEST_MESSAGE_ACTION = 'RCMR_IN010000UK05'; // Electronic Healthcare Record Request Started (GP2GP v1.1)

export const sendMessage = message =>
  new Promise((resolve, reject) => {
    channelPool.channel(async (err, channel) => {
      if (err) {
        logEvent('mhs-connection-failed');
        return reject(err);
      }

      const interactionId = await extractInteractionId(message);
      logEvent('sendMessage call', { mhs: { interactionId } });

      if (interactionId === EHR_REQUEST_MESSAGE_ACTION) {
        await sendToQueue(generateEhrExtractResponse());
      }

      channel.close();
      resolve();
    });
  });

export const getRoutingInformation = odsCode => Promise.resolve({ asid: `asid-${odsCode}` });
