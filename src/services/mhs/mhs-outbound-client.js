import axios from 'axios';
import { initializeConfig } from '../../config';
import { logError } from '../../middleware/logging';

const validateInputs = ({ interactionId, conversationId, message }) => {
  if (interactionId && conversationId && message) return;

  const errorMessages = [];
  if (!interactionId) errorMessages.push('interactionId must be passed in');
  if (!conversationId) errorMessages.push('conversationId must be passed in');
  if (!message) errorMessages.push('message must be passed in');

  const error = new Error(errorMessages);

  logError('validation failed', error);
  throw error;
};

export const stripXMLMessage = xml =>
  xml
    .trim()
    .replace(/\r?\n|\r/g, '')
    .replace(/>\s+</g, '><');

export const sendMessage = ({ interactionId, conversationId, odsCode = 'YES', message } = {}) => {
  const config = initializeConfig();

  return new Promise((resolve, reject) => {
    validateInputs({ interactionId, conversationId, message });
    const axiosBody = {
      payload: stripXMLMessage(message)
    };

    const axiosHeaders = {
      headers: {
        'Content-Type': 'application/json',
        'Interaction-ID': interactionId,
        'Sync-Async': false,
        'Correlation-Id': conversationId,
        'Ods-Code': odsCode,
        'from-asid': config.deductionsAsid
      }
    };

    const url = config.mhsOutboundUrl;

    return axios
      .post(url, axiosBody, axiosHeaders)
      .then(resolve)
      .catch(error => {
        const errorMessage = `POST ${url} - ${error.message || 'Request failed'}`;
        const axiosError = new Error(errorMessage);
        logError(errorMessage, axiosError);
        reject(axiosError);
      });
  });
};
