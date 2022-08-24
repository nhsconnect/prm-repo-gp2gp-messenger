import { wrangleAttachments } from '../mhs-attachments-wrangler';

describe('wrangleAttachments', () => {
  it('should extract a relevant mhs outbound attachments object from an mhs json for a single in-message (cid) attachment', async () => {
    const sparseEnvelopeXmlWithOneAttachment = `
<?xml version="1.0" ?>
<soap:Envelope xmlns:eb="http://www.oasis-open.org/committees/ebxml-msg/schema/msg-header-2_0.xsd" xmlns:hl7ebxml="urn:hl7-org:transport/ebxml/DSTUv1.0" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header>
    </soap:Header>
    <soap:Body>
        <eb:Manifest eb:version="2.0" soap:mustUnderstand="1">
            <eb:Reference xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="cid:Content1@e-mis.com/EMISWeb/GP2GP2.2A">
                <eb:Description xml:lang="en">RCMR_IN030000UK06</eb:Description>
                <hl7ebxml:Payload style="HL7" encoding="XML" version="3.0"/>
            </eb:Reference>
            <eb:Reference xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="cid:Attachment1@e-mis.com/EMISWeb/GP2GP2.2A" eb:id="_E9FBA6F2-96F3-4863-95E7-B5CF34964D85">
                <eb:Description xml:lang="en">E9FBA6F2-96F3-4863-95E7-B5CF34964D85_attachment.txt</eb:Description>
            </eb:Reference>
        </eb:Manifest>
    </soap:Body>
</soap:Envelope>
`;
    const mhsJsonForSingleAttachmentSmallEhr = {
      ebXML: sparseEnvelopeXmlWithOneAttachment,
      payload: '<some_hl7_payload></some_hl7_payload>',
      attachments: [
        {
          payload: 'some attachment content',
          is_base64: false,
          content_id: 'Attachment1@e-mis.com/EMISWeb/GP2GP2.2A',
          content_type: 'text/plain'
        }
      ]
    };

    const attachmentsInfo = await wrangleAttachments(mhsJsonForSingleAttachmentSmallEhr);

    expect(attachmentsInfo).toEqual({
      attachments: [
        {
          payload: 'some attachment content',
          is_base64: false,
          content_type: 'text/plain',
          description: 'E9FBA6F2-96F3-4863-95E7-B5CF34964D85_attachment.txt',
          document_id: 'E9FBA6F2-96F3-4863-95E7-B5CF34964D85'
        }
      ]
    });
  });

  it('should extract an empty attachment info object for an EHR without attachments', async () => {
    const sparseEnvelopeXmlWithNoAttachments = `
<?xml version="1.0" ?>
<soap:Envelope xmlns:eb="http://www.oasis-open.org/committees/ebxml-msg/schema/msg-header-2_0.xsd" xmlns:hl7ebxml="urn:hl7-org:transport/ebxml/DSTUv1.0" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header>
    </soap:Header>
    <soap:Body>
        <eb:Manifest eb:version="2.0" soap:mustUnderstand="1">
            <eb:Reference xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="cid:Content1@e-mis.com/EMISWeb/GP2GP2.2A">
                <eb:Description xml:lang="en">RCMR_IN030000UK06</eb:Description>
                <hl7ebxml:Payload style="HL7" encoding="XML" version="3.0"/>
            </eb:Reference>
        </eb:Manifest>
    </soap:Body>
</soap:Envelope>
`;
    const mhsJsonForZeroAttachmentsSmallEhr = {
      ebXML: sparseEnvelopeXmlWithNoAttachments,
      payload: '<some_hl7_payload></some_hl7_payload>',
      attachments: []
    };

    const attachmentsInfo = await wrangleAttachments(mhsJsonForZeroAttachmentsSmallEhr);

    expect(attachmentsInfo).toEqual({});
  });

  it('should extract an empty attachment info object if no ebxml in MHS json', async () => {
    const mhsJsonForZeroAttachmentsSmallEhr = {
      payload: '<some_hl7_payload></some_hl7_payload>',
      attachments: []
    };

    const attachmentsInfo = await wrangleAttachments(mhsJsonForZeroAttachmentsSmallEhr);

    expect(attachmentsInfo).toEqual({});
  });

  it('should extract an empty attachment info object if no references in ebxml in MHS json', async () => {
    const noReferencesEbxml = `
<?xml version="1.0" ?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header>
    </soap:Header>
    <soap:Body>
    </soap:Body>
</soap:Envelope>
`;

    const mhsJsonForZeroAttachmentsSmallEhr = {
      ebXML: noReferencesEbxml,
      payload: '<some_hl7_payload></some_hl7_payload>',
      attachments: []
    };

    const attachmentsInfo = await wrangleAttachments(mhsJsonForZeroAttachmentsSmallEhr);

    expect(attachmentsInfo).toEqual({});
  });

  it('should extract an empty attachment info object if no attachments in MHS json', async () => {
    const noReferencesEbxml = `
<?xml version="1.0" ?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
</soap:Envelope>
`;

    const mhsJsonForZeroAttachmentsSmallEhr = {
      ebXML: noReferencesEbxml,
      payload: '<some_hl7_payload></some_hl7_payload>'
    };

    const attachmentsInfo = await wrangleAttachments(mhsJsonForZeroAttachmentsSmallEhr);

    expect(attachmentsInfo).toEqual({});
  });

  it('should not blow up on an EHR with more than 1 attachment', async () => {
    const sparseEnvelopeXmlWithTwoAttachments = `
<?xml version="1.0" ?>
<soap:Envelope xmlns:eb="http://www.oasis-open.org/committees/ebxml-msg/schema/msg-header-2_0.xsd" xmlns:hl7ebxml="urn:hl7-org:transport/ebxml/DSTUv1.0" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header>
    </soap:Header>
    <soap:Body>
        <eb:Manifest eb:version="2.0" soap:mustUnderstand="1">
            <eb:Reference xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="cid:Content1@e-mis.com/EMISWeb/GP2GP2.2A">
                <eb:Description xml:lang="en">RCMR_IN030000UK06</eb:Description>
                <hl7ebxml:Payload style="HL7" encoding="XML" version="3.0"/>
            </eb:Reference>
            <eb:Reference xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="cid:Attachment1@e-mis.com/EMISWeb/GP2GP2.2A" eb:id="_E9FBA6F2-96F3-4863-95E7-B5CF34964D85">
                <eb:Description xml:lang="en">E9FBA6F2-96F3-4863-95E7-B5CF34964D85_attachment.txt</eb:Description>
            </eb:Reference>
            <eb:Reference xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="cid:Attachment2@e-mis.com/EMISWeb/GP2GP2.2A" eb:id="_F9FBA6F2-96F3-4863-95E7-B5CF34964D85">
                <eb:Description xml:lang="en">F9FBA6F2-96F3-4863-95E7-B5CF34964D85_attachment2.txt</eb:Description>
            </eb:Reference>
        </eb:Manifest>
    </soap:Body>
</soap:Envelope>
`;
    const mhsJsonForSingleAttachmentSmallEhr = {
      ebXML: sparseEnvelopeXmlWithTwoAttachments,
      payload: '<some_hl7_payload></some_hl7_payload>',
      attachments: [
        {
          payload: 'some attachment content',
          is_base64: false,
          content_id: 'Attachment1@e-mis.com/EMISWeb/GP2GP2.2A',
          content_type: 'text/plain'
        },
        {
          payload: 'some more attachment content',
          is_base64: false,
          content_id: 'Attachment2@e-mis.com/EMISWeb/GP2GP2.2A',
          content_type: 'text/plain'
        }
      ]
    };

    const attachmentsInfo = await wrangleAttachments(mhsJsonForSingleAttachmentSmallEhr);

    expect(attachmentsInfo.attachments).toBeTruthy();
  });
});
