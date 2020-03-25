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

export const setTransferComplete = async (conversationId, messageId) => {
  try {
    const response = await axios.patch(
      `${config.ehrRepoUrl}/health-record/${conversationId}/message/${messageId}`,
      {
        transferComplete: true
      }
    );
    updateLogEvent({ ehrRepository: { transferSuccessful: true } });
    return response;
  } catch (err) {
    updateLogEvent({ status: 'failed to update transfer complete to ehr repo api', error: err });
    throw err;
  }
};
