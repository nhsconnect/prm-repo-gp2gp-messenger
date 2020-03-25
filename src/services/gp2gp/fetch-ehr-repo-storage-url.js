import axios from 'axios';
import axiosRetry from 'axios-retry';
import config from '../../config';
import { eventFinished, updateLogEvent } from '../../middleware/logging';

axiosRetry(axios, {
  retries: 2,
  retryDelay: retryCount => {
    updateLogEvent({ status: `axios retry times: ${retryCount}` });
    eventFinished();
    return 1000;
  }
});

export const fetchStorageUrl = async (conversationId, body) => {
  try {
    return await axios.post(
      `${config.ehrRepoUrl}/health-record/${conversationId}/new/message`,
      body
    );
  } catch (err) {
    updateLogEvent({ status: 'failed to get pre-signed url', error: err.stack });
    throw err;
  } finally {
    eventFinished();
  }
};
