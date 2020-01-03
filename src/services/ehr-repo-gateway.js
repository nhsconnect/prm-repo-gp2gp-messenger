import axios from 'axios';
import config from '../config';

const fetchStorageUrl = (conversationId, messageId) =>
  axios
    .post(`${config.ehrRepoUrl}/health-record/${conversationId}/message`, { messageId })
    .then(response => response.data);

export const storeMessageInEhrRepo = (message, conversationId, messageId) =>
  fetchStorageUrl(conversationId, messageId).then(url => axios.put(url, message));
