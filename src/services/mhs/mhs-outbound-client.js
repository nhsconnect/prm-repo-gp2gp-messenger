import axios from 'axios';
import { initializeConfig } from '../../config';
import { logError } from '../../middleware/logging';
import { sendToQueue } from '../sqs/sqs-client';

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

export const sendMessage = async ({
  interactionId,
  conversationId,
  odsCode,
  message,
  messageId = null
} = {}) => {
  const config = initializeConfig();
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

  try {
    const response = await axios.post(config.mhsOutboundUrl, axiosBody, axiosHeaders);
    await sendToQueue({
      response: { data: response.data, status: response.status },
      request: { body: axiosBody, headers: axiosHeaders }
    });
    return response;
  } catch (error) {
    const errorMessage = `POST ${config.mhsOutboundUrl} - ${error.message || 'Request failed'}`;
    const axiosError = new Error(errorMessage);
    logError(errorMessage, axiosError);
    await sendToQueue({ error: axiosError, request: { body: axiosBody, headers: axiosHeaders } });
    throw axiosError;
  }
};
