import axios from 'axios';
import { initialiseConfig } from '../../config';
import { updateLogEvent, updateLogEventWithError } from '../../middleware/logging';

export const sendEhrRequest = async (nhsNumber, conversationId, odsCode) => {
  const config = initialiseConfig();
  const url = `${config.repoToGpUrl}/registration-requests/`;
  const body = {
    data: {
      type: 'registration-requests',
      id: conversationId,
      attributes: {
        nhsNumber,
        odsCode
      }
    }
  };
  const headers = { headers: { Authorization: config.repoToGpAuthKeys } };

  try {
    await axios.post(url, body, headers);
    updateLogEvent({ status: `EHR Request successfully sent to repo-to-gp` });
  } catch (err) {
    updateLogEventWithError({ message: `Cannot send EHR request to repo-to-gp: ${err.message}` });
    throw err;
  }
};
