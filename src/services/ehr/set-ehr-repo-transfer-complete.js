import axios from 'axios';
import { initialiseConfig } from '../../config';
import { updateLogEvent, updateLogEventWithError } from '../../middleware/logging';

export const setTransferComplete = async body => {
  const config = initialiseConfig();
  try {
    const response = await axios.patch(
      `${config.ehrRepoUrl}/fragments`,
      {
        conversationId: body.conversationId,
        transferComplete: true
      },
      { headers: { Authorization: `${config.ehrRepoAuthKeys}` } }
    );
    updateLogEvent({ ehrRepository: { transferSuccessful: true } });
    return response;
  } catch (err) {
    updateLogEventWithError({
      status: 'failed to update transfer complete to ehr repo api',
      error: err
    });
    throw err;
  }
};
