import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from '../../gp2gp';
import { extractAction } from '../../parser/soap';
import { PDSGeneralUpdateRequestAccepted, PDS_GENERAL_UPDATE_REQUEST_ACCEPTED } from '../../pds';
import { DefaultMessage } from './';
import { parseMultipartBody } from '../../parser';

export const handleMessage = async message => {
  let interactionId;

  try {
    interactionId = await extractAction(parseMultipartBody(message)[0].body);
  } catch (err) {
    interactionId = '';
  }

  let handler;

  switch (interactionId) {
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
