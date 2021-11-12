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

export const sendMessage = ({
  interactionId,
  conversationId,
  odsCode,
  message,
  messageId = null
} = {}) => {
  const config = initializeConfig();

  return new Promise((resolve, reject) => {
    validateInputs({ interactionId, conversationId, odsCode, message });
    const axiosBody = {
      payload: stripXMLMessage(message)
    };

    const headers = {
      headers: {
        'Content-Type': 'application/json',
        'Interaction-ID': interactionId,
        'Correlation-Id': conversationId,
        'Ods-Code': odsCode,
        'from-asid': config.deductionsAsid,
        'wait-for-response': false
      }
    };

    const axiosHeaders = !messageId
      ? headers
      : { headers: { ...headers.headers, 'Message-Id': messageId } };

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
