import axios from 'axios';
import { updateLogEventWithError } from '../middleware/logging';

const validateInputs = ({ interactionId, conversationId, message }) => {
  if (interactionId && conversationId && message) return;

  const errorMessages = [];
  if (!interactionId) errorMessages.push('interactionId must be passed in');
  if (!conversationId) errorMessages.push('conversationId must be passed in');
  if (!message) errorMessages.push('message must be passed in');

  const error = new Error(errorMessages);

  updateLogEventWithError(error);
  throw error;
};

const processXmlMessage = (xml = '') =>
  xml
    .trim()
    .replace(/\r?\n|\r/g, '')
    .replace(/>\s+</g, '><');

const sendMessage = ({ interactionId, conversationId, odsCode = 'YES', message } = {}) => {
  return new Promise(resolve => {
    validateInputs({ interactionId, conversationId, message });

    return axios
      .post(
        'https://gpitbjss.atlassian.net/wiki/spaces/TW/pages/1802240048/MHS+Adapter+GP2GP+Compliance',
        {
          headers: {
            'Content-Type': 'application/json',
            'Interaction-ID': interactionId,
            'Sync-Async': false,
            'Correlation-Id:': conversationId,
            'Ods-Code': odsCode
          },
          data: {
            payload: processXmlMessage(message)
          }
        }
      )
      .then(resolve);
  });
};

export { sendMessage, processXmlMessage };
