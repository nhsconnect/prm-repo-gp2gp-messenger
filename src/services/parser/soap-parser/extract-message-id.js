import { XmlParser } from '../xml-parser';

export const extractMessageId = async message => {
  return await new XmlParser()
    .parse(message)
    .then(messageObject => messageObject.findFirst('MessageId'))
    .catch(() => {
      throw Error('Message does not contain message id');
    });
};
