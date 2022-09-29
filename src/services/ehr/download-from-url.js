import axios from 'axios';
import { logError, logInfo } from '../../middleware/logging';

export const downloadFromUrl = async (messageUrl, description) => {
  try {
    const res = await axios.get(messageUrl);
    logInfo('Successfully retrieved ' + description);
    return res.data;
  } catch (err) {
    logError('Cannot retrieve ' + description, err);
    throw err;
  }
};
