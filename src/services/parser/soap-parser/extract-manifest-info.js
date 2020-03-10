import { XmlParser } from '../xml-parser';

export const extractManifestInfo = async message => {
  return await new XmlParser()
    .parse(message)
    .then(messageObject => messageObject.findAll('Manifest'))
    .catch(() => {
      throw Error('Message does not contain manifestInfo');
    });
};
