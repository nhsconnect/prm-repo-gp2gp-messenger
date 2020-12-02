import { logEvent, logError } from '../../../middleware/logging';
import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from '../../gp2gp';
import { EhrRequest, EHR_REQUEST } from '../../gp2gp/ehr-request';
import { parseMultipartBody } from '../../parser';
import { extractAction } from '../../parser/soap';
import { PDSGeneralUpdateRequestAccepted, PDS_GENERAL_UPDATE_REQUEST_ACCEPTED } from '../../pds';
import { DefaultMessage } from './';

export const handleMessage = async message => {
  let interactionId;

  try {
    const multipartMessage = parseMultipartBody(message);
    logEvent('Extracting Action from Message', {
      messageHeaders: multipartMessage.map(message => message.headers || 'unknown')
    });
    interactionId = await extractAction(multipartMessage[0].body);
  } catch (err) {
    logError('parseMultipartBody error', err);
    interactionId = 'undefined';
  }

  logEvent(`interactionId: ${interactionId}`);

  let handler;

  switch (interactionId) {
    case EHR_REQUEST:
      handler = new EhrRequest();
      break;

    case EHR_REQUEST_COMPLETED:
      handler = new EHRRequestCompleted();
      break;

    case PDS_GENERAL_UPDATE_REQUEST_ACCEPTED:
      handler = new PDSGeneralUpdateRequestAccepted();
      break;

    default:
      handler = new DefaultMessage();
  }

  return handler.handleMessage(message);
};
