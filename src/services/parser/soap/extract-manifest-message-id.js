import { extractManifestInfo } from './extract-manifest-info';

const uuidPattern = /^.*([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}).*$/i;

export const extractManifestAsMessageIds = async message => {
  const manifestInfo = await extractManifestInfo(message);
  return manifestInfo.map(item => item.href.match(uuidPattern)[1]);
};
