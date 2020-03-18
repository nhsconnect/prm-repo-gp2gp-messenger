import { XmlParser } from '../xml-parser';

export const extractManifestInfo = async message => {
  const result = [];
  const messageObject = await new XmlParser().parse(message);
  const manifest = messageObject.findAll('Manifest');

  if (manifest[0] && manifest[0].Reference) {
    const reference = manifest[0].Reference;
    Array.isArray(reference) ? result.push(...reference) : result.push(reference);
  }
  return result;
};
