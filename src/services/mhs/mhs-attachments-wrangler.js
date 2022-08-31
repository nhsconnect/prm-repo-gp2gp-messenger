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

  const attachmentReferences = await extractAttachmentReferences(mhsJsonMessage);

  if (attachmentReferences == null) {
    logInfo('No attachment reference');
    return {};
  }

  const description = extractDescription(attachmentReferences[1]);
  if (description == null) {
    logInfo('No attachment description');
    return {};
  }

  const document_id = extractDocumentId(attachmentReferences[1]);

  const outboundAttachments = mhsJsonMessage.attachments.map(a =>
    composeOutboundAttachment(description, document_id, a)
  );

  const attachmentsInfo = {
    attachments: outboundAttachments
  };

  logInfo('Attachments wrangled: ' + JSON.stringify(attachmentsInfo));
  return attachmentsInfo;
};

function composeOutboundAttachment(description, document_id, attachment) {
  const outboundAttachment = { ...attachment };

  delete outboundAttachment.content_id;

  outboundAttachment.description = description;
  outboundAttachment.document_id = document_id;

  if (!attachment.is_base64) {
    logInfo('Encoding / forcing to base64');
    outboundAttachment.is_base64 = true;
    outboundAttachment.payload = base64Encoded(attachment.payload);
  }
  return outboundAttachment;
}

async function extractAttachmentReferences(mhsJsonMessage) {
  return await new XmlParser()
    .parse(mhsJsonMessage.ebXML)
    .then(jsObject => jsObject.findAll('Reference'))
    .then(references => {
      logInfo('Total number of references including hl7 core: ' + references.length);
      if (references.length < 2) {
        logInfo('No attachments to wrangle');
        return null;
      }
      return references;
    });
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
