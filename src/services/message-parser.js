export const EHR_EXTRACT_MESSAGE_ACTION = 'RCMR_IN030000UK06';
export const EHR_REQUEST_MESSAGE_ACTION = 'RCMR_IN010000UK05';
export const CONTINUE_MESSAGE_ACTION = 'COPC_IN000001UK01';

export const extractConversationId = message => {
  const matches = message.match(/<eb:ConversationId>(.*?)<\/eb:ConversationId>/);
  if (!matches) {
    throw new Error('Message does not contain conversation id');
  }
  return matches[1];
};

export const extractMessageId = message => {
  const matches = message.match(/<eb:MessageId>(.*?)<\/eb:MessageId>/);
  if (!matches) {
    throw new Error('Message does not contain message id');
  }
  return matches[1];
};

export const extractFoundationSupplierAsid = message => {
  const matches = message.match(
    /<communicationFunctionSnd[\s\S]*?extension="(.*?)"[\s\S]*<\/communicationFunctionSnd>/
  );
  if (!matches) {
    throw new Error('Message does not contain foundation supplier ASID');
  }
  return matches[1];
};

export const extractAction = message => {
  const matches = message.match(/<eb:Action>(.*?)<\/eb:Action>/);
  if (!matches) {
    throw new Error('Message does not contain action');
  }
  return matches[1];
};

export const extractInteractionId = message => {
  const matches = message.match(/<interactionId[\s\S]*?extension="(.*?)"/);
  if (!matches) {
    throw new Error('Message does not contain interaction id');
  }
  return matches[1];
};

export const containsNegativeAcknowledgement = message =>
  message.includes('<eb:acknowledgement typeCode="AR">') ||
  message.includes('<eb:acknowledgement typeCode="AE">');
