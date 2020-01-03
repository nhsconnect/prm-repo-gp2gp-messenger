import axios from 'axios';
import config from '../config';

export const fetchStorageUrl = (conversationId, messageId) => {
  return axios
    .post(`${config.ehrRepoUrl}/health-record/${conversationId}/message`, { messageId })
    .then(response => response.data);
};
