// this is gonna take ebXML parameter, thanks lint
import { XmlParser } from '../parser/xml-parser/xml-parser';
import { logInfo } from '../../middleware/logging';

export const wrangleAttachments = async mhsJsonMessage => {
  if (mhsJsonMessage.attachments === undefined) {
    logInfo('No MHS json attachments []');
    return {};
  }

  if (mhsJsonMessage.ebXML === undefined) {
    logInfo('No MHS json ebXML');
    return {};
  }

  logInfo('Got MHS json with ebXML and attachments[] length: ' + mhsJsonMessage.attachments.length);

  const attachment = mhsJsonMessage.attachments[0];
  const outboundAttachment = { ...attachment };
  delete outboundAttachment.content_id;

  const attachmentReference = await new XmlParser()
    .parse(mhsJsonMessage.ebXML)
    .then(jsObject => jsObject.findAll('Reference'))
    .then(references => {
      logInfo('Total number of references including hl7 core: ' + references.length);
      if (references.length < 2) {
        logInfo('No attachments to wrangle');
        return null;
      }
      return references[1];
    });

  if (attachmentReference == null) {
    logInfo('No attachment reference');
    return {};
  }

  const description = attachmentReference.Description.innerText;
  const eb_id = attachmentReference.id;
  const document_id = eb_id.substring(1);

  if (description == null) {
    logInfo('No attachment description');
    return {};
  }

  outboundAttachment.description = description;
  outboundAttachment.document_id = document_id;

  const attachmentsInfo = {
    attachments: [outboundAttachment]
  };

  logInfo('Attachments wrangled: ' + JSON.stringify(attachmentsInfo));
  return attachmentsInfo;
};
