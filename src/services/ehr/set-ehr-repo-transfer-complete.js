import axios from 'axios';
import { initializeConfig } from '../../config';
import { logEvent, logError } from '../../middleware/logging';

export const setTransferComplete = async body => {
  const config = initializeConfig();
  try {
    const response = await axios.patch(
      `${config.ehrRepoUrl}/fragments`,
      {
        conversationId: body.conversationId,
        transferComplete: true
      },
      { headers: { Authorization: `${config.ehrRepoAuthKeys}` } }
    );
    logEvent('setTransferComplete success', { ehrRepository: { transferSuccessful: true } });
    return response;
  } catch (err) {
    logError('failed to update transfer complete to ehr repo api', {
      error: err
    });
    throw err;
  }
};
