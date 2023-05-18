import { initializeConfig } from '../../../config';
import { xmlStringToJsObject, jsObjectToXmlString, updateIdExtension} from "./utilities/message-utilities";

export const updateExtractForSending = async (
  ehrExtract,
  ehrRequestId,
  receivingAsid,
  sendingOdsCode
) => {
  const config = initializeConfig();
  const parsedEhr = await xmlStringToJsObject(ehrExtract);

  const sendingAsid = config.deductionsAsid;

  const rcmrUK06 = parsedEhr.RCMR_IN030000UK06;
  const controlActEvent = rcmrUK06.ControlActEvent;

  updateIdExtension(rcmrUK06.communicationFunctionRcv.device, receivingAsid);
  updateIdExtension(rcmrUK06.communicationFunctionSnd.device, sendingAsid);
  updateIdExtension(controlActEvent.author1.AgentSystemSDS.agentSystemSDS, sendingAsid);
  controlActEvent.subject.EhrExtract.inFulfillmentOf.priorEhrRequest.id["@_root"] = ehrRequestId;

  updateAuthorOdsCode(controlActEvent.subject.EhrExtract, sendingOdsCode);
  updateAuthorOdsCode(controlActEvent.subject.EhrExtract.component.ehrFolder, sendingOdsCode);

  return jsObjectToXmlString(parsedEhr)
};

// export const xmlStringToJsObject = async (xmlString) => {
//   return new XMLParser({ processEntities: false, ignoreAttributes: false }).parse(xmlString);
// }
//
// export const jsObjectToXmlString = (jsObject) => {
//   return new XMLBuilder({processEntities: false, ignoreAttributes: false, suppressBooleanAttributes: false}).build(jsObject);
// }
//
// export const updateId = (field, newId) => {
//   field.id["@_extension"] = newId;
// };

const updateAuthorOdsCode = (authorParent, sendingOdsCode) => {
  const field = authorParent.author.AgentOrgSDS.agentOrganizationSDS;
  updateIdExtension(field, sendingOdsCode);
}