import axios from 'axios';
import config from '../../config';
import { eventFinished, updateLogEvent } from '../../middleware/logging';

export const sendPdsUpdate = async conversationId => {
  try {
    return await axios.patch(
      `${config.gpToRepoUrl}/deduction-requests/${conversationId}/pds-update`
    );
  } catch (err) {
    updateLogEvent({ status: 'failed to send PATCH request with PDS Update', error: err.stack });
    throw err;
  } finally {
    eventFinished();
  }
};
