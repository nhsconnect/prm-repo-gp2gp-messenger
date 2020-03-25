export const nhsNumber = '9465731285';
export const conversationId = 'some-conversation-id-123';
export const messageId = '159fc184-0799-4783-adcb-0b311e35ea64';

export const messageWithoutConversationId = `
------=_MIME-Boundary
<SOAP-ENV:Envelope>
  <SOAP-ENV:Header>
    <eb:CPAId>S2036482A2160104</eb:CPAId>
    <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
    <eb:Action>PRPA_IN000202UK01</eb:Action>
    <eb:MessageData>
        <eb:MessageId>${messageId}</eb:MessageId>
        <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
    </eb:MessageData>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
------=_MIME-Boundary--`;

export const messageWithoutMessageId = `
------=_MIME-Boundary
<SOAP-ENV:Envelope>
  <SOAP-ENV:Header>
    <eb:CPAId>S2036482A2160104</eb:CPAId>
    <eb:ConversationId>${conversationId}</eb:ConversationId>
    <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
    <eb:Action>PRPA_IN000202UK01</eb:Action>
    <eb:MessageData>
        <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
    </eb:MessageData>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
------=_MIME-Boundary--`;

export const pdsGenerateUpdateRequest = `SpESs���$374E4FD6-E1E0-48C0-BBB0-5ADA51344E6B@@@@@�umultipart/related; boundary="--=_MIME-Boundary"; charset="UTF-8"; type="text/xml"; start="<ebXMLHeader@spine.nhs.uk>"Sw��----=_MIME-Boundary
Content-Id: <ebXMLHeader@spine.nhs.uk>
Content-Type: text/xml
Content-Transfer-Encoding: 8bit

<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:eb="http://www.oasis-open.org/committees/ebxml-msg/schema/msg-header-2_0.xsd" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3c.org/2001/XML-Schema-Instance">
   <soap:Header>
      <eb:MessageHeader eb:version="2.0" soap:mustUnderstand="1">
         <eb:From>
            <eb:PartyId eb:type="urn:nhs:names:partyType:ocs+serviceInstance">YES-0000806</eb:PartyId>
         </eb:From>
         <eb:To>
            <eb:PartyId eb:type="urn:nhs:names:partyType:ocs+serviceInstance">B86041-822103</eb:PartyId>
         </eb:To>
         <eb:CPAId>82e0f4374fb8a0a57522</eb:CPAId>
         <eb:ConversationId>${conversationId}</eb:ConversationId>
         <eb:Service>urn:nhs:names:services:pds</eb:Service>
         <eb:Action>PRPA_IN000202UK01</eb:Action>
         <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2020-03-25T12:07:48Z</eb:Timestamp>
            <eb:RefToMessageId>4FEA53B3-8773-4514-8914-C1D58309F4BA</eb:RefToMessageId>
         </eb:MessageData>
         <eb:DuplicateElimination />
      </eb:MessageHeader>
      <eb:AckRequested eb:version="2.0" soap:mustUnderstand="1" soap:actor="urn:oasis:names:tc:ebxml-msg:actor:toPartyMSH" eb:signed="false" />
      <eb:SyncReply eb:version="2.0" soap:mustUnderstand="1" soap:actor="http://schemas.xmlsoap.org/soap/actor/next" />
   </soap:Header>
   <soap:Body>
      <eb:Manifest xmlns:hl7ebxml="urn:hl7-org:transport/ebXML/DSTUv1.0" eb:version="2.0">
         <eb:Reference xlink:href="cid:${messageId}@spine.nhs.uk">
            <eb:Schema eb:location="urn:hl7-org:v3_PRPA_IN000202UK01.xsd" eb:version="01" />
            <eb:Description xml:lang="en">The HL7 payload</eb:Description>
            <hl7ebxml:Payload style="HL7" encoding="XML" version="3.0" />
         </eb:Reference>
      </eb:Manifest>
   </soap:Body>
</soap:Envelope>


----=_MIME-Boundary
Content-Id: <${messageId}@spine.nhs.uk>
Content-Type: application/xml
Content-Transfer-Encoding: 8bit

<?xml version="1.0" encoding="UTF-8"?>
<hl7:PRPA_IN000202UK01 xmlns:hl7="urn:hl7-org:v3">
</hl7:PRPA_IN000202UK01>

----=_MIME-Boundary--`;
