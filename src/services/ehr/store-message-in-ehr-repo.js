import { logEvent, logError } from '../../middleware/logging';
import { fetchStorageUrl } from './fetch-ehr-repo-storage-url';
import { putMessageInEhrRepo } from './put-message-in-ehr-repo';
import { setTransferComplete } from './set-ehr-repo-transfer-complete';

const storeMessageInEhrRepo = async (message, soapInformation) => {
  try {
    const { data: url } = await fetchStorageUrl(soapInformation);
    logEvent('Storing EHR in s3 bucket', { ehrRepository: { url } });
    await putMessageInEhrRepo(url, message);
    await setTransferComplete(soapInformation);
  } catch (err) {
    logError('failed to store message to ehr repository', {
      error: err.stack
    });
  }
};

export { storeMessageInEhrRepo };
