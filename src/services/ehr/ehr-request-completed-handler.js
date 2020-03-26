import { eventFinished, updateLogEvent } from '../../middleware/logging';
import { fetchStorageUrl } from './fetch-ehr-repo-storage-url';
import { setTransferComplete } from './set-ehr-repo-transfer-complete';
import { storeMessageInEhrRepo } from './store-message-in-ehr-repo';

const ehrRequestCompletedHandler = async (message, soapInformation) => {
  try {
    const { data: url } = await fetchStorageUrl(soapInformation.conversationId, soapInformation);
    updateLogEvent({ status: 'Storing EHR in s3 bucket', ehrRepository: { url } });
    await storeMessageInEhrRepo(url, message);
    await setTransferComplete(soapInformation.conversationId, soapInformation.messageId);
  } catch (err) {
    updateLogEvent({
      status: 'failed to store message to ehr repository',
      error: err.stack
    });
  } finally {
    eventFinished();
  }
};

export { ehrRequestCompletedHandler };
