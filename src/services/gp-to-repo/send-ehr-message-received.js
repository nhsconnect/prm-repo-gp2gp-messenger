import axios from 'axios';
import { initialiseConfig } from '../../config';
import { updateLogEventWithError } from '../../middleware/logging';

export const sendEhrMessageReceived = async (conversationId, messageId) => {
  const config = initialiseConfig();
  const url = `${config.gpToRepoUrl}/deduction-requests/${conversationId}/ehr-message-received`;
  try {
    return await axios.patch(
      url,
      { messageId },
      { headers: { Authorization: `${config.gpToRepoAuthKeys}` } }
    );
  } catch (err) {
    const axiosError = new Error(`PATCH ${url} - ${err.message || 'Request failed'}`);
    updateLogEventWithError(axiosError);
    throw axiosError;
  }
};
