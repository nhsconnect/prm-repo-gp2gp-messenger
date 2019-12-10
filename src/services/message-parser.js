export const EHR_EXTRACT_MESSAGE_ACTION = 'RCMR_IN030000UK06';
export const EHR_REQUEST_MESSAGE_ACTION = 'RCMR_IN010000UK05';
export const CONTINUE_MESSAGE_ACTION = 'COPC_IN000001UK01';

export const extractConversationId = message => {
  const matches = message.match(/<eb:ConversationId>(.*?)<\/eb:ConversationId>/);
  return matches[1];
};

export const extractMessageId = message => {
  const matches = message.match(/<eb:MessageId>(.*?)<\/eb:MessageId>/);
  return matches[1];
};

export const extractFoundationSupplierAsid = message => {
  const matches = message.match(/<communicationFunctionSnd[\s\S]*?extension="(.*?)"/);
  return matches[1];
};

export const extractAction = message => {
  const matches = message.match(/<eb:Action>(.*?)<\/eb:Action>/);
  return matches[1];
};

export const extractInteractionId = message => {
  const matches = message.match(/<interactionId[\s\S]*?extension="(.*?)"/);
  return matches[1];
};
