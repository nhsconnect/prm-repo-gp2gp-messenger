import axios from 'axios';
import { eventFinished, updateLogEvent, updateLogEventWithError } from '../../middleware/logging';
import { initialiseConfig } from '../../config';

export const putMessageInEhrRepo = async (url, message) => {
  const config = initialiseConfig();
  try {
    const response = await axios.put(url, message, {
      headers: { Authorization: `${config.ehrRepoAuthKeys}` }
    });
    updateLogEvent({
      ehrRepository: { responseCode: response.status, responseMessage: response.statusText }
    });
    return response;
  } catch (err) {
    updateLogEventWithError({
      status: 'failed to store message to s3 via pre-signed url',
      error: err.stack
    });
    throw err;
  } finally {
    eventFinished();
  }
};
