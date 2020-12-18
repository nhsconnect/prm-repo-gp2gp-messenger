import { XmlParser } from '../xml-parser';

export const replaceInFulfillmentOf = async (ehrExtract, ehrRequestId) => {
  const parsedEhr = await new XmlParser().parse(ehrExtract);
  const parsedExtract = parsedEhr.data.RCMR_IN030000UK06.ControlActEvent.subject.EhrExtract;
  const priorEhrRequest = parsedExtract.inFulfillmentOf.priorEhrRequest;
  const oldId = priorEhrRequest.id.root;
  return ehrExtract.replace(oldId, ehrRequestId);
};
