import fileSave from '../storage/file-system';
import s3Save from '../storage/s3';
import config from '../config';
import * as mhsGateway from './mhs-gateway';
import * as mhsGatewayFake from './mhs-gateway-fake';
import { generateContinueRequest } from '../templates/continue-template';
import uuid from 'uuid/v4';
import moment from 'moment';
import {
  EHR_EXTRACT_MESSAGE_ACTION,
  extractAction,
  extractConversationId,
  extractFoundationSupplierAsid,
  extractMessageId,
  containsNegativeAcknowledgement
} from './message-parser';
import { updateLogEvent } from '../middleware/logging';

const sendContinueMessage = async (message, messageId) => {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const foundationSupplierAsid = await extractFoundationSupplierAsid(message);
  const continueRequest = generateContinueRequest(
    uuid(),
    timestamp,
    foundationSupplierAsid,
    config.deductionsAsid,
    messageId
  );

  return config.isPTL
    ? mhsGateway.sendMessage(continueRequest)
    : mhsGatewayFake.sendMessage(continueRequest);
};

const storeMessage = (message, conversationId, messageId) =>
  config.isLocal
    ? fileSave(message, conversationId, messageId)
    : s3Save(message, conversationId, messageId);

const handleMessage = async message => {
  updateLogEvent({ status: 'handling-message' });

  const conversationId = await extractConversationId(message);
  const messageId = await extractMessageId(message);
  const action = await extractAction(message);
  const isNegativeAcknowledgement = containsNegativeAcknowledgement(message);

  updateLogEvent({
    message: {
      conversationId,
      messageId,
      action,
      isLocal: config.isLocal,
      isNegativeAcknowledgement
    }
  });

  if (isNegativeAcknowledgement) {
    throw new Error('Message is a negative acknowledgement');
  }

  return storeMessage(message, conversationId, messageId).then(() => {
    if (action === EHR_EXTRACT_MESSAGE_ACTION) {
      return sendContinueMessage(message, messageId);
    }
  });
};

export default handleMessage;
