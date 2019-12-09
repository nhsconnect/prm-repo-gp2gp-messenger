import fileSave from '../storage/file-system';
import s3Save from '../storage/s3';
import config from '../config';

const extractConversationId = message => {
  const matches = message.match(/<eb:ConversationId>(.*?)<\/eb:ConversationId>/);
  return matches[1];
};

const extractMessageId = message => {
  const matches = message.match(/<eb:MessageId>(.*?)<\/eb:MessageId>/);
  return matches[1];
};

const handleMessage = message => {
  const conversationId = extractConversationId(message);
  const messageId = extractMessageId(message);

  if (config.isLocal) {
    fileSave(message, conversationId, messageId);
  } else {
    s3Save(message, conversationId, messageId);
  }
};

export default handleMessage;
