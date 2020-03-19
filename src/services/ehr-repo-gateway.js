import axios from 'axios';
import axiosRetry from 'axios-retry';
import config from '../config';
import { eventFinished, updateLogEvent } from '../middleware/logging';
import { EHRRequestCompleted } from '../services/gp2gp';

axiosRetry(axios, {
  retries: 2,
  retryDelay: retryCount => {
    updateLogEvent({ status: `axios retry times: ${retryCount}` });
    eventFinished();
    return 1000;
  }
});

const fetchStorageUrl = (conversationId, body) =>
  axios
    .post(`${config.ehrRepoUrl}/health-record/${conversationId}/new/message`, body)
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

export const storeMessageInEhrRepo = async (message, soapInformation) => {
  const { nhsNumber } = await new EHRRequestCompleted().handleMessage(message);
  const body = nhsNumber ? { ...soapInformation, nhsNumber } : soapInformation;

  return fetchStorageUrl(soapInformation.conversationId, body)
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
    .then(() => setTransferComplete(soapInformation.conversationId, soapInformation.messageId))
    .then(() => updateLogEvent({ ehrRepository: { transferSuccessful: true } }))
    .catch(err => {
      updateLogEvent({
        status: 'failed to store message to ehr repository',
        error: err.stack
      });
    })
    .finally(() => eventFinished());
};
