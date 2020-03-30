import { XmlParser } from '../xml-parser';

export const extractAction = async message => {
  return await new XmlParser()
    .parse(message)
    .then(messageObject => messageObject.findFirst('Action'));
};
