// this is gonna take ebXML parameter, thanks lint
import {XmlParser} from "../parser/xml-parser/xml-parser";
import {logInfo} from "../../middleware/logging";

export const wrangleAttachments = async (mhsJsonMessage) => {

  const attachment = mhsJsonMessage.attachments[0];
  const outboundAttachment = {...attachment};
  delete outboundAttachment.content_id;

  const description = await new XmlParser()
    .parse(mhsJsonMessage.ebXML)
    .then(jsObject => jsObject.findAll('Reference'))
    .then(references => {
      logInfo('Total number of references including hl7 core: ' + references.length);
      if (references.length < 2) {
        return null
      }
      return references[1].Description.innerText;
    });

  if (description == null) {
    return {}
  }

  outboundAttachment.description = description;

  return {
    attachments: [outboundAttachment]
  };
};
