import axios from 'axios';
import { eventFinished, updateLogEvent } from '../../middleware/logging';

export const putMessageInEhrRepo = async (url, message) => {
  try {
    const response = await axios.put(url, message);
    updateLogEvent({
      ehrRepository: { responseCode: response.status, responseMessage: response.statusText }
    });
    return response;
  } catch (err) {
    updateLogEvent({
      status: 'failed to store message to s3 via pre-signed url',
      error: err.stack
    });
    throw err;
  } finally {
    eventFinished();
  }
};
