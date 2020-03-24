import { updateLogEvent } from '../middleware/logging';
import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from './gp2gp/ehr-request-completed';
import { containsNegativeAcknowledgement } from './parser/message';
import { parseMultipartBody } from './parser/multipart-parser';
import { extractAction } from './parser/soap';
import { soapEnvelopeHandler } from './soap';

const handleMessage = async message => {
  updateLogEvent({ status: 'handling-message' });
  const multipartMessage = await parseMultipartBody(message);

  const soapInformation = await soapEnvelopeHandler(multipartMessage[0].body);

  const isNegativeAcknowledgement = await containsNegativeAcknowledgement(message);

  updateLogEvent({
    message: {
      ...soapInformation,
      isNegativeAcknowledgement
    }
  });

  if (isNegativeAcknowledgement) {
    updateLogEvent({ status: 'handling negative acknowledgement' });
    throw new Error('Message is a negative acknowledgement');
  }

  const interactionId = await extractAction(message);
  switch (interactionId) {
    case EHR_REQUEST_COMPLETED:
      await new EHRRequestCompleted().handleMessage(message);
      break;
    default:
      // TODO: Write a test
      updateLogEvent({
        status: 'Message Handler not implemented for interactionId',
        message: {
          ...soapInformation,
          isNegativeAcknowledgement
        }
      });
  }
};

export default handleMessage;
