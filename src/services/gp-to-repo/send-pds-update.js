import axios from 'axios';
import config from '../../config';
import { eventFinished, updateLogEvent } from '../../middleware/logging';

export const sendPdsUpdate = async conversationId => {
  try {
    const url = `${config.gpToRepoUrl}/deduction-requests/${conversationId}/pds-update`;
    return await axios.patch(url, { headers: { Authorization: `${config.gpToRepoAuthKeys}` } });
  } catch (err) {
    updateLogEvent({ status: 'failed to send PATCH request with PDS Update', error: err.stack });
    throw err;
  } finally {
    eventFinished();
  }
};
