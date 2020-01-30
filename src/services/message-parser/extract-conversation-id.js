import { XmlParser } from './xml-parser';

export const extractConversationId = message => {
  return new XmlParser()
    .parse(message)
    .then(messageObject => messageObject.findFirst('ConversationId'));
};
