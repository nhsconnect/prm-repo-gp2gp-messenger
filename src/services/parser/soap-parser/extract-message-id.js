export const extractMessageId = message => {
  const matches = message.match(/<eb:MessageId>(.*?)<\/eb:MessageId>/);
  if (!matches) {
    throw new Error('Message does not contain message id');
  }
  return matches[1];
};
