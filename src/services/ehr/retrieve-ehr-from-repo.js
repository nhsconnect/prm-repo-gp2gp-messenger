import axios from 'axios';
import { logError, logEvent } from '../../middleware/logging';

export const retrieveEhrFromRepo = async ehrUrl => {
  try {
    const res = await axios.get(ehrUrl);
    logEvent('Successfully retrieved EHR from repo');
    return res.data;
  } catch (err) {
    logError('Cannot retrieve EHR extract from repo', err);
    throw err;
  }
};
