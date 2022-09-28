import axios from 'axios';
import { logError, logInfo } from '../../middleware/logging';

export const retrieveMessageFromRepo = async messageUrl => {
  try {
    const res = await axios.get(messageUrl);
    logInfo('Successfully retrieved EHR from repo');
    return res.data;
  } catch (err) {
    logError('Cannot retrieve EHR extract from repo', err);
    throw err;
  }
};
