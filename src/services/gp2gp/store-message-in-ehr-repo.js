import axios from 'axios';
import axiosRetry from 'axios-retry';
import { eventFinished, updateLogEvent } from '../../middleware/logging';

axiosRetry(axios, {
  retries: 2,
  retryDelay: retryCount => {
    updateLogEvent({ status: `axios retry times: ${retryCount}` });
    eventFinished();
    return 1000;
  }
});

export const storeMessageInEhrRepo = async (url, message) => {
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
