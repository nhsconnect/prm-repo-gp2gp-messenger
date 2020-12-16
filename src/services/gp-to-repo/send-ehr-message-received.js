import axios from 'axios';
import { initializeConfig } from '../../config';
import { logError } from '../../middleware/logging';

export const sendEhrMessageReceived = async (conversationId, messageId) => {
  const config = initializeConfig();
  const url = `${config.gpToRepoUrl}/deduction-requests/${conversationId}/ehr-message-received`;
  try {
    return await axios.patch(
      url,
      { messageId },
      { headers: { Authorization: `${config.gpToRepoAuthKeys}` } }
    );
  } catch (err) {
    const errorMessage = `PATCH ${url} - ${err.message || 'Request failed'}`;
    const axiosError = new Error(errorMessage);
    logError(errorMessage, err);
    throw axiosError;
  }
};
