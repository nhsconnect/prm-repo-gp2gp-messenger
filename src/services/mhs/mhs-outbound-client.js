import axios from 'axios';
import config from '../../config';
import { updateLogEventWithError } from '../../middleware/logging';

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

const stripXMLMessage = xml =>
  xml
    .trim()
    .replace(/\r?\n|\r/g, '')
    .replace(/>\s+</g, '><');

const sendMessage = ({ interactionId, conversationId, odsCode = 'YES', message } = {}) => {
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
        const axiosError = new Error(`POST ${url} - ${error.message || 'Request failed'}`);
        updateLogEventWithError(axiosError);
        reject(axiosError);
      });
  });
};

export { sendMessage, stripXMLMessage };
