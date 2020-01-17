import axios from 'axios';
import config from '../config';
import { updateLogEvent } from '../middleware/logging';

const fetchStorageUrl = (conversationId, messageId) =>
  axios
    .post(`${config.ehrRepoUrl}/health-record/${conversationId}/message`, { messageId })
    .then(response => response.data);

const setTransferComplete = (conversationId, messageId) =>
  axios.put(`${config.ehrRepoUrl}/health-record/${conversationId}/message/${messageId}`, {
    transferComplete: true
  });

export const storeMessageInEhrRepo = (message, conversationId, messageId) =>
  fetchStorageUrl(conversationId, messageId)
    .then(url => {
      updateLogEvent({ ehrRepository: { url: url } });
      return axios.put(url, message);
    })
    .then(response => {
      updateLogEvent({ ehrRepository: { response: response.status } });
    })
    .then(() => setTransferComplete(conversationId, messageId))
    .then(() => updateLogEvent({ ehrRepository: { transferSuccessful: true } }));
