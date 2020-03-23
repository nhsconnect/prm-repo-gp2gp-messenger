import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';
import config from '../config';
import { updateLogEvent, updateLogEventWithError } from '../middleware/logging';
import { generateContinueRequest } from '../templates/continue-template';
import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from './gp2gp/ehr-request-completed';
import * as mhsGatewayFake from './mhs/mhs-old-queue-test-helper';
import {
  containsNegativeAcknowledgement,
  EHR_EXTRACT_MESSAGE_ACTION,
  extractFoundationSupplierAsid
} from './parser/message';
import { parseMultipartBody } from './parser/multipart-parser';
import { extractAction } from './parser/soap';
import { soapEnvelopeHandler } from './soap';

const sendContinueMessage = async (message, messageId) => {
  const timestamp = dayjs().format('YYYYMMDDHHmmss');
  const foundationSupplierAsid = await extractFoundationSupplierAsid(message);
  const continueRequest = generateContinueRequest(
    uuid(),
    timestamp,
    foundationSupplierAsid,
    config.deductionsAsid,
    messageId
  );

  return mhsGatewayFake.sendMessage(continueRequest).catch(err => {
    updateLogEventWithError(err);
    return Promise.reject(err);
  });
};

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
      console.log('Message Handler not implemented');
  }

  if (soapInformation.action === EHR_EXTRACT_MESSAGE_ACTION) {
    updateLogEvent({ status: 'sending continue message' });
    await sendContinueMessage(message, soapInformation.messageId);
  }
};

export default handleMessage;
