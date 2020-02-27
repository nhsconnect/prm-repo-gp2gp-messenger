import { parseMultipartBody } from '../index';

const syncSpineAcknowledgementExample = `----=_MIME-Boundary
Content-Id: <ebXMLHeader@spine.nhs.uk>
Content-Type: text/xml
Content-Transfer-Encoding: 8bit

<?xml version='1.0' encoding='UTF-8'?>
<soap:Envelope xmlns:xsi="http://www.w3c.org/2001/XML-Schema-Instance" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:eb="http://www.oasis-open.org/committees/ebxml-msg/schema/msg-header-2_0.xsd" xmlns:xlink="http://www.w3.org/1999/xlink"><soap:Header><eb:MessageHeader eb:version="2.0" soap:mustUnderstand="1"><eb:From><eb:PartyId eb:type="urn:nhs:names:partyType:ocs+serviceInstance">YEA-0000806</eb:PartyId></eb:From><eb:To><eb:PartyId eb:type="urn:nhs:names:partyType:ocs+serviceInstance">B86041-822103</eb:PartyId></eb:To><eb:CPAId>0dcf6ba78c4633f931ca</eb:CPAId><eb:ConversationId>6A073022-182F-4106-92CC-86E933F71A3E</eb:ConversationId><eb:Service>urn:nhs:names:services:gp2gp</eb:Service><eb:Action>MCCI_IN010000UK13</eb:Action><eb:MessageData><eb:MessageId>745E2784-5194-11EA-A5FB-F40343488B16</eb:MessageId><eb:Timestamp>2020-02-17T14:47:43Z</eb:Timestamp><eb:RefToMessageId>8610C310-5978-4331-B26F-176D21287597</eb:RefToMessageId></eb:MessageData><eb:DuplicateElimination/></eb:MessageHeader><eb:AckRequested eb:version="2.0" soap:mustUnderstand="1" soap:actor="urn:oasis:names:tc:ebxml-msg:actor:toPartyMSH" eb:signed="false"/><eb:SyncReply eb:version="2.0" soap:mustUnderstand="1" soap:actor="http://schemas.xmlsoap.org/soap/actor/next"/></soap:Header><soap:Body><eb:Manifest xmlns:hl7ebxml="urn:hl7-org:transport/ebXML/DSTUv1.0" eb:version="2.0"><eb:Reference xlink:href="cid:745E2784-5194-11EA-A5FB-F40343488B16@spine.nhs.uk"><eb:Schema eb:location="urn:hl7-org:v3_MCCI_IN010000UK13.xsd" eb:version="13"/><eb:Description xml:lang="en">The HL7 payload</eb:Description><hl7ebxml:Payload style="HL7" encoding="XML" version="3.0"/></eb:Reference></eb:Manifest></soap:Body></soap:Envelope>

----=_MIME-Boundary
Content-Id: <745E2784-5194-11EA-A5FB-F40343488B16@spine.nhs.uk>
Content-Type: application/xml
Content-Transfer-Encoding: 8bit

<?xml version='1.0' encoding='UTF-8'?>
<hl7:MCCI_IN010000UK13 xmlns:hl7="urn:hl7-org:v3"><hl7:id root="745E2784-5194-11EA-A5FB-F40343488B16"/><hl7:creationTime value="20200217144743"/><hl7:versionCode code="V3NPfIT3.0"/><hl7:interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="MCCI_IN010000UK13"/><hl7:processingCode code="P"/><hl7:processingModeCode code="T"/><hl7:acceptAckCode code="NE"/><hl7:acknowledgement typeCode="AR"><hl7:acknowledgementDetail typeCode="ER"><hl7:code code="506" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.32" displayName="hl7:{interactionId}/hl7:communicationFunctionRcv/hl7:device/hl7:id/@extension is missing, empty, invalid or ACL violation"/></hl7:acknowledgementDetail><hl7:messageRef><hl7:id root="E91401BB-5B96-4574-BFE2-CDF535BD3E42"/></hl7:messageRef></hl7:acknowledgement><hl7:communicationFunctionRcv typeCode="RCV"><hl7:device classCode="DEV" determinerCode="INSTANCE"><hl7:id root="1.2.826.0.1285.0.2.0.107" extension="200000001161"/></hl7:device></hl7:communicationFunctionRcv><hl7:communicationFunctionSnd typeCode="SND"><hl7:device classCode="DEV" determinerCode="INSTANCE"><hl7:id root="1.2.826.0.1285.0.2.0.107" extension="088132148037"/></hl7:device></hl7:communicationFunctionSnd><hl7:ControlActEvent classCode="CACT" moodCode="EVN"><hl7:author1 typeCode="AUT"><hl7:AgentSystemSDS classCode="AGNT"><hl7:agentSystemSDS classCode="DEV" determinerCode="INSTANCE"><hl7:id root="1.2.826.0.1285.0.2.0.107" extension="088132148037"/></hl7:agentSystemSDS></hl7:AgentSystemSDS></hl7:author1></hl7:ControlActEvent></hl7:MCCI_IN010000UK13>

----=_MIME-Boundary--`;

const asyncSpineAcknowledgementExample = `SpESs�A�$00722412-C3CC-4DE9-A670-6A558E31F0D6@@@@@�application/jsonSt�N�
message-id�$F8C728B2-93A9-445C-B0DB-60C686A9E0C2�correlation-id�777777Sw�${syncSpineAcknowledgementExample}`;

describe('multipart-parser', () => {
  describe('Spine Acknowledgement', () => {
    let parsedAcknowledgement;

    beforeAll(() => {
      parsedAcknowledgement = parseMultipartBody(syncSpineAcknowledgementExample);
    });

    it('should include two results in output', () => {
      expect(parsedAcknowledgement.length).toBe(2);
    });

    it('should have correct Content-Id header in the first result', () => {
      expect('Content-Id' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Id']).toBe('<ebXMLHeader@spine.nhs.uk>');
    });

    it('should have correct Content-Type header in the first result', () => {
      expect('Content-Type' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Type']).toBe('text/xml');
    });

    it('should have correct Content-Transfer-Encoding header in the first result', () => {
      expect('Content-Transfer-Encoding' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Transfer-Encoding']).toBe('8bit');
    });

    it('should have correct Content-Id header in the second result', () => {
      expect('Content-Id' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Id']).toBe(
        '<745E2784-5194-11EA-A5FB-F40343488B16@spine.nhs.uk>'
      );
    });

    it('should have correct Content-Type header in the second result', () => {
      expect('Content-Type' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Type']).toBe('application/xml');
    });

    it('should have correct Content-Transfer-Encoding header in the second result', () => {
      expect('Content-Transfer-Encoding' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Transfer-Encoding']).toBe('8bit');
    });

    it('should have a string body starting with xml header', () => {
      expect(parsedAcknowledgement[0].body).toMatch(
        /^<\?xml version='1\.0' encoding='UTF-8'\?><(.*)$/
      );
    });

    it('should contain the soap envelope in the first result', () => {
      expect(parsedAcknowledgement[0].body).toMatch(/^(.*)<soap:Envelope(.*)<\/soap:Envelope>$/);
    });

    it('should contain the message in the second result', () => {
      expect(parsedAcknowledgement[1].body).toMatch(
        /^(.*)<hl7:MCCI_IN010000UK13(.*)<\/hl7:MCCI_IN010000UK13>$/
      );
    });
  });

  describe('Asynchronous Spine Acknowledgement', () => {
    let parsedAcknowledgement;

    beforeAll(() => {
      parsedAcknowledgement = parseMultipartBody(asyncSpineAcknowledgementExample);
    });

    it('should include two results in output', () => {
      expect(parsedAcknowledgement.length).toBe(2);
    });

    it('should have correct Content-Id header in the first result', () => {
      expect('Content-Id' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Id']).toBe('<ebXMLHeader@spine.nhs.uk>');
    });

    it('should have correct Content-Type header in the first result', () => {
      expect('Content-Type' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Type']).toBe('text/xml');
    });

    it('should have correct Content-Transfer-Encoding header in the first result', () => {
      expect('Content-Transfer-Encoding' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Transfer-Encoding']).toBe('8bit');
    });

    it('should have correct Content-Id header in the second result', () => {
      expect('Content-Id' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Id']).toBe(
        '<745E2784-5194-11EA-A5FB-F40343488B16@spine.nhs.uk>'
      );
    });

    it('should have correct Content-Type header in the second result', () => {
      expect('Content-Type' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Type']).toBe('application/xml');
    });

    it('should have correct Content-Transfer-Encoding header in the second result', () => {
      expect('Content-Transfer-Encoding' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Transfer-Encoding']).toBe('8bit');
    });

    it('should have a string body starting with xml header', () => {
      expect(parsedAcknowledgement[0].body).toMatch(
        /^<\?xml version='1\.0' encoding='UTF-8'\?><(.*)$/
      );
    });

    it('should contain the soap envelope in the first result', () => {
      expect(parsedAcknowledgement[0].body).toMatch(/^(.*)<soap:Envelope(.*)<\/soap:Envelope>$/);
    });

    it('should contain the message in the second result', () => {
      expect(parsedAcknowledgement[1].body).toMatch(
        /^(.*)<hl7:MCCI_IN010000UK13(.*)<\/hl7:MCCI_IN010000UK13>$/
      );
    });
  });
});
