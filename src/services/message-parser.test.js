import uuid from 'uuid/v4';
import {
  containsNegativeAcknowledgement,
  extractAction,
  extractConversationId,
  extractFoundationSupplierAsid,
  extractInteractionId,
  extractMessageId
} from './message-parser';

describe('message-parser', () => {
  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  describe('extractConversationId', () => {
    const expectedErrorMessage = 'Message does not contain conversation id';

    const testConversationId = uuid().toUpperCase();

    const realExample = `
    <SOAP:Header>
        <eb:MessageHeader SOAP:mustUnderstand="1" eb:version="2.0">
            <eb:ConversationId>${testConversationId}</eb:ConversationId>
        </eb:MessageHeader>
    </SOAP:Header>
    `;

    const exampleResolveXML = `
        <eb:Body>
            <eb:ConversationId>${testConversationId}</eb:ConversationId>
        </eb:Body>
    `;

    it('should extract the conversationId from XML body', () => {
      expect(extractConversationId(exampleResolveXML)).toBe(testConversationId);
    });

    it('should extract the conversationId from XML body in a real example', () => {
      expect(extractConversationId(realExample)).toBe(testConversationId);
    });

    it('should throw and error when conversationId does not exist', () => {
      expect(() => extractConversationId(exampleErrorXML)).toThrow(Error(expectedErrorMessage));
    });
  });

  describe('extractMessageId', () => {
    const expectedErrorMessage = 'Message does not contain message id';

    const testMessageId = uuid().toUpperCase();

    const realExample = `
    <SOAP:Header>
        <eb:MessageHeader SOAP:mustUnderstand="1" eb:version="2.0">
            <eb:MessageData>
			          <eb:MessageId>${testMessageId}</eb:MessageId>
			          <eb:Timestamp>2013-10-25T16:59:29Z</eb:Timestamp>
		        </eb:MessageData>
        </eb:MessageHeader>
    </SOAP:Header>
    `;

    const exampleResolveXML = `
        <eb:Body>
            <eb:MessageId>${testMessageId}</eb:MessageId>
        </eb:Body>
    `;

    it('should extract the conversationId from XML body', () => {
      expect(extractMessageId(exampleResolveXML)).toBe(testMessageId);
    });

    it('should extract the conversationId from XML body in a real example', () => {
      expect(extractMessageId(realExample)).toBe(testMessageId);
    });

    it('should throw and error when conversationId does not exist', () => {
      expect(() => extractMessageId(exampleErrorXML)).toThrow(Error(expectedErrorMessage));
    });
  });

  describe('extractFoundationSupplierAsid', () => {
    const expectedErrorMessage = 'Message does not contain foundation supplier ASID';

    const testFoundationSupplierAisd = '715373337545';

    const realExample = `
    <RCMR_IN030000UK06>
        <id root="C258107F-7A3F-4FB5-8B36-D7C0F6496A17" />
        <communicationFunctionRcv typeCode="RCV">
            <device classCode="DEV" determinerCode="INSTANCE">
                <id root="1.2.826.0.1285.0.2.0.107" extension="276827251543" />
            </device>
        </communicationFunctionRcv>
        <communicationFunctionSnd typeCode="SND">
            <device classCode="DEV" determinerCode="INSTANCE">
                <id root="1.2.826.0.1285.0.2.0.107" extension="${testFoundationSupplierAisd}" />
            </device>
        </communicationFunctionSnd>
    </RCMR_IN030000UK06>
    `;

    const exampleResolveXML = `
        <eb:Body>
            <communicationFunctionSnd typeCode="SND">
                <id root="1.2.826.0.1285.0.2.0.107" extension="${testFoundationSupplierAisd}" />
            </communicationFunctionSnd>
        </eb:Body>
    `;

    it('should extract the conversationId from XML body', () => {
      expect(extractFoundationSupplierAsid(exampleResolveXML)).toBe(testFoundationSupplierAisd);
    });

    it('should extract the conversationId from XML body in a real example', () => {
      expect(extractFoundationSupplierAsid(realExample)).toBe(testFoundationSupplierAisd);
    });

    it('should throw and error when conversationId does not exist', () => {
      expect(() => extractFoundationSupplierAsid(exampleErrorXML)).toThrow(
        Error(expectedErrorMessage)
      );
    });
  });

  describe('extractAction', () => {
    const expectedErrorMessage = 'Message does not contain action';

    const testAction = 'RCMR_IN030000UK06';

    const realExample = `

    <SOAP:Header>
        <eb:MessageHeader SOAP:mustUnderstand="1" eb:version="2.0">
            <eb:Action>${testAction}</eb:Action>
        </eb:MessageHeader>
    </SOAP:Header>
    `;

    const exampleResolveXML = `
        <eb:Body>
            <eb:Action>${testAction}</eb:Action>
        </eb:Body>
    `;

    it('should extract the conversationId from XML body', () => {
      expect(extractAction(exampleResolveXML)).toBe(testAction);
    });

    it('should extract the conversationId from XML body in a real example', () => {
      expect(extractAction(realExample)).toBe(testAction);
    });

    it('should throw and error when conversationId does not exist', () => {
      expect(() => extractAction(exampleErrorXML)).toThrow(Error(expectedErrorMessage));
    });
  });

  describe('extractInteractionId', () => {
    const expectedErrorMessage = 'Message does not contain interaction id';

    const testInteractionId = 'RCMR_IN030000UK05';

    const realExample = `
    <RCMR_IN030000UK05>
        <id root="C258107F-7A3F-4FB5-8B36-D7C0F6496A17" />
        <interactionId root="2.16.840.1.113883.2.1.3.2.4.12"
            extension="${testInteractionId}" />
    </RCMR_IN030000UK05>
    `;

    const exampleResolveXML = `
        <eb:Body>
            <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="${testInteractionId}" />
        </eb:Body>
    `;

    it('should extract the conversationId from XML body', () => {
      expect(extractInteractionId(exampleResolveXML)).toBe(testInteractionId);
    });

    it('should extract the conversationId from XML body in a real example', () => {
      expect(extractInteractionId(realExample)).toBe(testInteractionId);
    });

    it('should throw and error when conversationId does not exist', () => {
      expect(() => extractInteractionId(exampleErrorXML)).toThrow(Error(expectedErrorMessage));
    });
  });

  // Not that in a real example this acknowledgement is not prefixed with eb: as in the implementation - to clarify
  describe('containsNegativeAcknowledgement', () => {
    const realExample = `
    <COPC_IN000001UK01 xmlns="urn:hl7-org:v3">
      <ControlActEvent classCode="CACT" moodCode="EVN">
        <subject typeCode="SUBJ" contextConductionInd="false">
            <pertinentInformation typeCode="PERT">
              <pertinentPayloadBody moodCode="EVN" classCode="OBS">
                <value>
                  <gp:Gp2gpfragment>
                    <Message xmlns="urn:hl7-org:v3" type="Message">
                      <eb:acknowledgement typeCode="AR">
                        <acknowledgementDetail typeCode="IF">
                          <code code="0" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.101" displayName="Continue"/>
                        </acknowledgementDetail>
                        <messageRef>
                          <id root="6E242658-3D8E-11E3-A7DC-172BDA00FA67"/>
                        </messageRef>
                      </eb:acknowledgement>
                    </Message>
                  </gp:Gp2gpfragment>
                </value>
              </pertinentPayloadBody>
            </pertinentInformation>
        </subject>
      </ControlActEvent>
    </COPC_IN000001UK01>
    `;

    const exampleNACK_1 = `
        <eb:Body>
            <eb:acknowledgement typeCode="AR">
        </eb:Body>
    `;

    const exampleNACK_2 = `
        <eb:Body>
            <eb:acknowledgement typeCode="AE">
        </eb:Body>
    `;

    const notNACKExample = `
        <eb:Body>
            <eb:acknowledgement typeCode="APE">
        </eb:Body>
    `;

    it('should contain negative acknowledgement (AR)', () => {
      expect(containsNegativeAcknowledgement(exampleNACK_1)).toBeTruthy();
    });

    it('should contain negative acknowledgement (AE)', () => {
      expect(containsNegativeAcknowledgement(exampleNACK_2)).toBeTruthy();
    });

    it('should contain negative acknowledgement (AR) in a real example', () => {
      expect(containsNegativeAcknowledgement(realExample)).toBeTruthy();
    });

    it('should not contain negative acknowledgement', () => {
      expect(containsNegativeAcknowledgement(notNACKExample)).toBeFalsy();
    });
  });
});
