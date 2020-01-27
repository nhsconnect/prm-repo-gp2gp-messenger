import axios from 'axios';
import config from '../config';
import { updateLogEvent } from '../middleware/logging';

const fetchStorageUrl = (conversationId, messageId) =>
  axios
    .post(`${config.ehrRepoUrl}/health-record/${conversationId}/message`, { messageId })
    .then(response => {
      return response.data;
    })
    .catch(err => updateLogEvent({ status: 'failed to get pre-signed url', error: err }));

const setTransferComplete = (conversationId, messageId) =>
  axios
    .put(`${config.ehrRepoUrl}/health-record/${conversationId}/message/${messageId}`, {
      transferComplete: true
    })
    .catch(err =>
      updateLogEvent({ status: 'failed to update transfer complete to ehr repo api', error: err })
    );

export const storeMessageInEhrRepo = (message, conversationId, messageId) => {
  return fetchStorageUrl(conversationId, messageId)
    .then(url => {
      updateLogEvent({ status: 'got url', url });
      updateLogEvent({ ehrRepository: { url: url } });
      return axios.put(url, message);
    })
    .then(response => updateLogEvent({ ehrRepository: { response: response.status } }))
    .then(() => setTransferComplete(conversationId, messageId))
    .then(() => updateLogEvent({ ehrRepository: { transferSuccessful: true } }))
    .catch(err =>
      updateLogEvent({
        status: 'failed to store message to s3 bucket via pre-signed url',
        error: err
      })
    );
};
