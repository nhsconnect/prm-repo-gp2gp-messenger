import { soapEnvelopeHandler } from '../';

describe('soapEnvelopeHandler', () => {
  it('should return object containing conversationId', () => {
    return expect(soapEnvelopeHandler(message)).resolves.toEqual(
      expect.objectContaining({
        conversationId
      })
    );
  });

  it('should return object containing manifest', () => {
    const expectedManifestInfo = ['23e1591d-455e-11e3-9c76-31def0104cb3'];
    return expect(soapEnvelopeHandler(message)).resolves.toEqual(
      expect.objectContaining({
        manifest: expectedManifestInfo
      })
    );
  });

  it('should return object containing messageId', () => {
    return expect(soapEnvelopeHandler(message)).resolves.toEqual(
      expect.objectContaining({
        messageId
      })
    );
  });

  it('should return object containing action', () => {
    return expect(soapEnvelopeHandler(message)).resolves.toEqual(
      expect.objectContaining({
        action
      })
    );
  });
});

const conversationId = '74799658-43DF-11E3-805D-BBA66E7A9031';
const messageId = '047C22B4-613F-47D3-9A72-44A1758464FB';
const action = 'COPC_IN000001UK01';

const message = `<SOAP:Envelope xmlns:xsi="http://www.w3c.org/2001/XML-Schema-Instance" xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/" xmlns:eb="http://www.oasis-open.org/committees/ebxml-msg/schema/msg-header-2_0.xsd" xmlns:hl7ebxml="urn:hl7-org:transport/ebxml/DSTUv1.0" xmlns:xlink="http://www.w3.org/1999/xlink">
<SOAP:Header>
	<eb:MessageHeader SOAP:mustUnderstand="1" eb:version="2.0">
		<eb:From>
			<eb:PartyId eb:type="urn:nhs:names:partyType:ocs+serviceInstance">RHM-801710</eb:PartyId>
		</eb:From>
		<eb:To>
			<eb:PartyId eb:type="urn:nhs:names:partyType:ocs+serviceInstance">RHM-803229</eb:PartyId>
		</eb:To>
		<eb:CPAId>S2030731A2137927</eb:CPAId>
		<eb:ConversationId>${conversationId}</eb:ConversationId>
		<eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
		<eb:Action>${action}</eb:Action>
		<eb:MessageData>
			<eb:MessageId>${messageId}</eb:MessageId>
			<eb:Timestamp>2013-11-04T14:33:58Z</eb:Timestamp>
		</eb:MessageData>
		<eb:DuplicateElimination/>
	</eb:MessageHeader>
	<eb:AckRequested SOAP:mustUnderstand="1" eb:version="2.0" eb:signed="false" SOAP:actor="urn:oasis:names:tc:ebxml-msg:actor:nextMSH"/>
	
</SOAP:Header>
<SOAP:Body>
	<eb:Manifest SOAP:mustUnderstand="1" eb:version="2.0">
		<eb:Reference xlink:href="cid:23e1591d-455e-11e3-9c76-31def0104cb3@spine.nhs.uk">
			<eb:Schema eb:location="http://www.nhsia.nhs.uk/schemas/HL7-Message.xsd" eb:version="1.0"/>
			<eb:Description xml:lang="en">HL7 payload</eb:Description> 
			<hl7ebxml:Payload style="HL7" encoding="XML" version="3.0"/>
		</eb:Reference>
	</eb:Manifest>
</SOAP:Body>
</SOAP:Envelope>`;
