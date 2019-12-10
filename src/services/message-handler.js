import fileSave from '../storage/file-system';
import s3Save from '../storage/s3';
import config from '../config';
import * as mhsGateway from './mhs-gateway';
import * as mhsGatewayFake from './mhs-gateway-fake';
import { generateContinueRequest } from '../templates/continue-template';
import uuid from 'uuid/v4';
import moment from 'moment';

const EHR_EXTRACT_MESSAGE_ACTION = 'RCMR_IN030000UK06';

const extractConversationId = message => {
  const matches = message.match(/<eb:ConversationId>(.*?)<\/eb:ConversationId>/);
  return matches[1];
};

const extractMessageId = message => {
  const matches = message.match(/<eb:MessageId>(.*?)<\/eb:MessageId>/);
  return matches[1];
};

const extractFoundationSupplierAsid = message => {
  const matches = message.match(
    /<communicationFunctionSnd[\s\S]*extension="(.*?)"[\s\S]*<\/communicationFunctionSnd>/
  );
  return matches[1];
};

const extractAction = message => {
  const matches = message.match(/<eb:Action>(.*?)<\/eb:Action>/);
  return matches[1];
};

const sendContinueMessage = (message, messageId) => {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const continueRequest = generateContinueRequest(
    uuid(),
    timestamp,
    extractFoundationSupplierAsid(message),
    config.deductionsAsid,
    messageId
  );

  return config.isPTL
    ? mhsGateway.sendMessage(continueRequest)
    : mhsGatewayFake.sendMessage(continueRequest);
};

const handleMessage = message => {
  const conversationId = extractConversationId(message);
  const messageId = extractMessageId(message);
  const action = extractAction(message);

  if (config.isLocal) {
    fileSave(message, conversationId, messageId);
  } else {
    s3Save(message, conversationId, messageId);
  }

  if (action === EHR_EXTRACT_MESSAGE_ACTION) {
    return sendContinueMessage(message, messageId);
  }

  return Promise.resolve();
};

export default handleMessage;
