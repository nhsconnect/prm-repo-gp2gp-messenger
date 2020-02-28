import axios from 'axios';
import axiosRetry from 'axios-retry';
import config from '../config';
import { eventFinished, updateLogEvent } from '../middleware/logging';

axiosRetry(axios, {
  retries: 2,
  retryDelay: retryCount => {
    updateLogEvent({ status: `axios retry times: ${retryCount}` });
    eventFinished();
    return 1000;
  }
});

const fetchStorageUrl = (conversationId, messageId) =>
  axios
    .post(`${config.ehrRepoUrl}/health-record/${conversationId}/message`, { messageId })
    .catch(err => {
      updateLogEvent({ status: 'failed to get pre-signed url', error: err.stack });
      throw err;
    })
    .finally(() => eventFinished());

const setTransferComplete = (conversationId, messageId) =>
  axios
    .patch(`${config.ehrRepoUrl}/health-record/${conversationId}/message/${messageId}`, {
      transferComplete: true
    })
    .catch(err => {
      updateLogEvent({ status: 'failed to update transfer complete to ehr repo api', error: err });
      throw err;
    });

export const storeMessageInEhrRepo = (message, conversationId, messageId) => {
  return fetchStorageUrl(conversationId, messageId)
    .then(response => {
      updateLogEvent({ status: 'Storing EHR in s3 bucket', ehrRepository: { url: response.data } });
      return axios
        .put(response.data, message)
        .catch(err => {
          updateLogEvent({
            status: 'failed to store message to s3 via pre-signed url',
            error: err.stack
          });
          throw err;
        })
        .finally(() => eventFinished());
    })
    .then(response =>
      updateLogEvent({
        ehrRepository: { responseCode: response.status, responseMessage: response.statusText }
      })
    )
    .then(() => setTransferComplete(conversationId, messageId))
    .then(() => updateLogEvent({ ehrRepository: { transferSuccessful: true } }))
    .catch(err => {
      updateLogEvent({
        status: 'failed to store message to ehr repository',
        error: err.stack
      });
    })
    .finally(() => eventFinished());
};
