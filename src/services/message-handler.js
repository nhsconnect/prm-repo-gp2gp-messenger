import dayjs from 'dayjs';
import uuid from 'uuid/v4';
import config from '../config';
import { updateLogEvent, updateLogEventWithError } from '../middleware/logging';
import { generateContinueRequest } from '../templates/continue-template';
import { storeMessageInEhrRepo } from './ehr-repo-gateway';
import * as mhsGatewayFake from './mhs/mhs-old-queue-test-helper';
import {
  containsNegativeAcknowledgement,
  EHR_EXTRACT_MESSAGE_ACTION,
  extractAction,
  extractConversationId,
  extractFoundationSupplierAsid,
  extractMessageId
} from './parser/soap-parser';

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
  const startTag = '<SOAP-ENV:Envelope';
  const envelopeStartIndex = message.indexOf(startTag);
  message = message.slice(envelopeStartIndex);
  const parsers = [
    extractConversationId(message),
    extractMessageId(message),
    extractAction(message)
  ];
  const extractResults = await Promise.all(parsers).catch(err => {
    throw Error(
      'Can’t process the EHR fragment successfully - missing conversation id or interaction id or message id',
      err
    );
  });
  const conversationId = extractResults[0];
  const messageId = extractResults[1];
  const action = extractResults[2];

  const isNegativeAcknowledgement = await containsNegativeAcknowledgement(message);

  updateLogEvent({
    message: {
      conversationId,
      messageId,
      action,
      isNegativeAcknowledgement
    }
  });

  if (isNegativeAcknowledgement) {
    updateLogEvent({ status: 'handling negative acknowledgement' });
    throw new Error('Message is a negative acknowledgement');
  }

  await storeMessageInEhrRepo(message, conversationId, messageId);
  await updateLogEvent({ status: 'store message to ehr repo' });

  if (action === EHR_EXTRACT_MESSAGE_ACTION) {
    await updateLogEvent({ status: 'sending continue message' });
    await sendContinueMessage(message, messageId);
  }
};

export default handleMessage;
