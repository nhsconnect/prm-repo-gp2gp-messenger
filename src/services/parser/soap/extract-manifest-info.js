import { XmlParser } from '../xml-parser';

export const extractManifestInfo = async message => {
  const messageObject = await new XmlParser().parse(message);

  const manifests = messageObject.findAll('Manifest');
  if (manifests.length < 1) {
    throw Error('Message does not contain manifestInfo');
  }
  return manifests;
};
