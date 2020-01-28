export const extractInteractionId = message => {
  const matches = message.match(/<interactionId[\s\S]*?extension="(.*?)"/);
  if (!matches) {
    throw new Error('Message does not contain interaction id');
  }
  return matches[1];
};
