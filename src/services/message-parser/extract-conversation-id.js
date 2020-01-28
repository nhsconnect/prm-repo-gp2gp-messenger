export const extractConversationId = message => {
  const matches = message.match(/<eb:ConversationId>(.*?)<\/eb:ConversationId>/);
  if (!matches) {
    throw new Error('Message does not contain conversation id');
  }
  return matches[1];
};
