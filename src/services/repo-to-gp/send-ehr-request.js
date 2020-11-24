import axios from 'axios';
import { initialiseConfig } from '../../config';

export const sendEhrRequest = async (nhsNumber, conversationId, odsCode) => {
  try {
    const config = initialiseConfig();
    const url = `${config.repoToGpUrl}/registration-requests/`;
    const body = { nhsNumber, conversationId, odsCode };
    const headers = { headers: { Authorization: config.repoToGpAuthKeys } };
    const response = await axios.post(url, body, headers);
    return response.status === 201;
  } catch (err) {
    console.log(err);
  }
};
