import axios from 'axios';
import { logError, logInfo } from '../../middleware/logging';

export const retrieveEhrFromRepo = async ehrUrl => {
  try {
    const res = await axios.get(ehrUrl);
    logInfo('Successfully retrieved EHR from repo');
    return res.data;
  } catch (err) {
    logError('Cannot retrieve EHR extract from repo', err);
    throw err;
  }
};
