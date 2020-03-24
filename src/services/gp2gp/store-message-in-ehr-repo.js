import axios from 'axios';
import axiosRetry from 'axios-retry';
import config from '../../config';
import { eventFinished, updateLogEvent } from '../../middleware/logging';

axiosRetry(axios, {
  retries: 2,
  retryDelay: retryCount => {
    updateLogEvent({ status: `axios retry times: ${retryCount}` });
    eventFinished();
    return 1000;
  }
});

const _fetchStorageUrl = (conversationId, body) =>
  axios
    .post(`${config.ehrRepoUrl}/health-record/${conversationId}/new/message`, body)
    .catch(err => {
      updateLogEvent({ status: 'failed to get pre-signed url', error: err.stack });
      throw err;
    })
    .finally(() => eventFinished());

const _setTransferComplete = (conversationId, messageId) =>
  axios
    .patch(`${config.ehrRepoUrl}/health-record/${conversationId}/message/${messageId}`, {
      transferComplete: true
    })
    .catch(err => {
      updateLogEvent({ status: 'failed to update transfer complete to ehr repo api', error: err });
      throw err;
    });

const _putMessage = async (url, message) => {
  updateLogEvent({ status: 'Storing EHR in s3 bucket', ehrRepository: { url } });
  return axios
    .put(url, message)
    .catch(err => {
      updateLogEvent({
        status: 'failed to store message to s3 via pre-signed url',
        error: err.stack
      });
      throw err;
    })
    .finally(() => eventFinished());
};

const storeMessageInEhrRepo = async (message, soapInformation) => {
  return _fetchStorageUrl(soapInformation.conversationId, soapInformation)
    .then(({ data: url }) => {
      return _putMessage(url, message);
    })
    .then(response =>
      updateLogEvent({
        ehrRepository: { responseCode: response.status, responseMessage: response.statusText }
      })
    )
    .then(() => _setTransferComplete(soapInformation.conversationId, soapInformation.messageId))
    .then(() => updateLogEvent({ ehrRepository: { transferSuccessful: true } }))
    .catch(err => {
      updateLogEvent({
        status: 'failed to store message to ehr repository',
        error: err.stack
      });
    })
    .finally(() => eventFinished());
};

export { storeMessageInEhrRepo };
