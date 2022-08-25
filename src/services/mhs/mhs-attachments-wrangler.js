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

  const attachmentReference = await extractAttachmentReference(mhsJsonMessage);

  if (attachmentReference == null) {
    logInfo('No attachment reference');
    return {};
  }

  const description = extractDescription(attachmentReference);
  if (description == null) {
    logInfo('No attachment description');
    return {};
  }

  const document_id = extractDocumentId(attachmentReference);
  const attachment = mhsJsonMessage.attachments[0];
  const outboundAttachment = { ...attachment };

  delete outboundAttachment.content_id;

  outboundAttachment.description = description;
  outboundAttachment.document_id = document_id;

  if (!attachment.is_base64) {
    logInfo('Encoding / forcing to base64');
    outboundAttachment.is_base64 = true;
    outboundAttachment.payload = base64Encoded(attachment.payload);
  }

  const attachmentsInfo = {
    attachments: [outboundAttachment]
  };

  logInfo('Attachments wrangled: ' + JSON.stringify(attachmentsInfo));
  return attachmentsInfo;
};

async function extractAttachmentReference(mhsJsonMessage) {
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
  return attachmentReference;
}

function extractDescription(attachmentReference) {
  const description = attachmentReference.Description.innerText;
  return description;
}

function extractDocumentId(attachmentReference) {
  const eb_id = attachmentReference.id;
  const document_id = eb_id.substring(1);
  return document_id;
}

function base64Encoded(raw) {
  let buff = new Buffer(raw);
  return buff.toString('base64');
}
