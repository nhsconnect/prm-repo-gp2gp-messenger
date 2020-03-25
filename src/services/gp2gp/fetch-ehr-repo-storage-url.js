import axios from 'axios';
import config from '../../config';
import { eventFinished, updateLogEvent } from '../../middleware/logging';

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
