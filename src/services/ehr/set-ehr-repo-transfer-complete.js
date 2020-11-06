import axios from 'axios';
import { initialiseConfig } from '../../config';
import { updateLogEvent } from '../../middleware/logging';

export const setTransferComplete = async body => {
  const config = initialiseConfig();
  try {
    const response = await axios.patch(`${config.ehrRepoUrl}/fragments`, {
      body,
      transferComplete: true
    });
    updateLogEvent({ ehrRepository: { transferSuccessful: true } });
    return response;
  } catch (err) {
    updateLogEvent({ status: 'failed to update transfer complete to ehr repo api', error: err });
    throw err;
  }
};
