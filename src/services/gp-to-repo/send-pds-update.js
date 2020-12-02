import axios from 'axios';
import { initialiseConfig } from '../../config';
import { logEvent } from '../../middleware/logging';

export const sendPdsUpdate = async conversationId => {
  const config = initialiseConfig();
  try {
    const url = `${config.gpToRepoUrl}/deduction-requests/${conversationId}/pds-update`;
    return await axios.patch(url, {}, { headers: { Authorization: `${config.gpToRepoAuthKeys}` } });
  } catch (err) {
    logEvent('failed to send PATCH request with PDS Update', { error: err.stack });
    throw err;
  }
};
