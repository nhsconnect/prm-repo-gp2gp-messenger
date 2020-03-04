export const extractAction = message => {
  const matches = message.match(/<eb:Action>(.*?)<\/eb:Action>/);
  if (!matches) {
    throw new Error('Message does not contain action');
  }
  return matches[1];
};
