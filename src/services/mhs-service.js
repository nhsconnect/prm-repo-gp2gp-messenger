import axios from 'axios';
import { updateLogEventWithError } from '../middleware/logging';

const validateInputs = ({ interactionId, conversationId }) => {
  if (interactionId && conversationId) return;

  const errorMessages = [];
  if (!interactionId) errorMessages.push('interactionId must be passed in');
  if (!conversationId) errorMessages.push('conversationId must be passed in');

  const error = new Error(errorMessages);

  updateLogEventWithError(error);
  throw error;
};

const sendMessage = ({ interactionId, conversationId, odsCode = 'YES' } = {}) => {
  return new Promise(resolve => {
    validateInputs({ interactionId, conversationId });

    return axios({
      method: 'POST',
      url:
        'https://gpitbjss.atlassian.net/wiki/spaces/TW/pages/1802240048/MHS+Adapter+GP2GP+Compliance',
      headers: {
        'Content-Type': 'application/json',
        'Interaction-ID': interactionId,
        'Sync-Async': false,
        'Correlation-Id:': conversationId,
        'Ods-Code': odsCode
      }
    }).then(resolve);
  });
};

export { sendMessage };
