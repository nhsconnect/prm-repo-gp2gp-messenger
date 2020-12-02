import axios from 'axios';
import { logEvent, logError } from '../../middleware/logging';

export const putMessageInEhrRepo = async (url, message) => {
  try {
    const response = await axios.put(url, message);
    logEvent('putMessageInEhrRepo success', {
      ehrRepository: { responseCode: response.status, responseMessage: response.statusText }
    });
    return response;
  } catch (err) {
    logError('failed to store message to s3 via pre-signed url', {
      error: err.stack
    });
    throw err;
  }
};
