import { XmlParser } from '../xml-parser';

export const extractConversationId = async message => {
  return await new XmlParser()
    .parse(message)
    .then(messageObject => messageObject.findFirst('ConversationId'));
};
