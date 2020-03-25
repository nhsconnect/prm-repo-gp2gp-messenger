import axios from 'axios';
import config from '../../config';
import { updateLogEvent } from '../../middleware/logging';

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
