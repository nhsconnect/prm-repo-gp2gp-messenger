import config from '../../../config';

export const conversationId = 'some-conversation-id-123';
export const messageId = 'some-message-id-456';
export const foundationSupplierAsid = 'foundation-supplier-asid';
export const ehrRequestCompletedMessage = `------=_MIME-Boundary
Content-Type: application/xml
Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
Content-Transfer-Encoding: 8bit

<SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:ConversationId>${conversationId}</eb:ConversationId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:Action>RCMR_IN030000UK06</eb:Action>
        <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>

    ------=_MIME-Boundary
  Content-Type: application/xml
  Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
  Content-Transfer-Encoding: 8bit

  <RCMR_IN030000UK06>
    <id root="${messageId}"/>
    <communicationFunctionRcv typeCode="RCV">
    <interactionId extension="RCMR_IN030000UK06" root="2.16.840.1.113883.2.1.3.2.4.12"/>
        <device classCode="DEV" determinerCode="INSTANCE">
            <id extension="${config.deductionsAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </device>
    </communicationFunctionRcv>
    <communicationFunctionSnd typeCode="SND">
        <device classCode="DEV" determinerCode="INSTANCE">
            <id extension="${foundationSupplierAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </device>
    </communicationFunctionSnd>
  </RCMR_IN030000UK06>

  ------=_MIME-Boundary--`;

export const ehrNotCompletedMessage = `
------=_MIME-Boundary
<SOAP-ENV:Envelope>
  <SOAP-ENV:Header>
    <eb:CPAId>S2036482A2160104</eb:CPAId>
    <eb:ConversationId>${conversationId}</eb:ConversationId>
    <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
    <eb:Action>COPC_IN000001UK01</eb:Action>
    <eb:MessageData>
        <eb:MessageId>${messageId}</eb:MessageId>
        <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
    </eb:MessageData>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
------=_MIME-Boundary--`;

export const messageWithoutConversationId = `
------=_MIME-Boundary
<SOAP-ENV:Envelope>
  <SOAP-ENV:Header>
    <eb:CPAId>S2036482A2160104</eb:CPAId>
    <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
    <eb:Action>COPC_IN000001UK01</eb:Action>
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
    <eb:Action>COPC_IN000001UK01</eb:Action>
    <eb:MessageData>
        <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
    </eb:MessageData>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
------=_MIME-Boundary--`;

export const messageWithoutAction = `
------=_MIME-Boundary
<SOAP-ENV:Envelope>
  <SOAP-ENV:Header>
    <eb:CPAId>S2036482A2160104</eb:CPAId>
    <eb:ConversationId>${conversationId}</eb:ConversationId>
    <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
    <eb:MessageData>
        <eb:MessageId>${messageId}</eb:MessageId>
        <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
    </eb:MessageData>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
------=_MIME-Boundary--`;

export const messageWithoutFoundationSupplierAsid = `
------=_MIME-Boundary
<SOAP-ENV:Envelope>
  <SOAP-ENV:Header>
    <eb:CPAId>S2036482A2160104</eb:CPAId>
    <eb:ConversationId>${conversationId}</eb:ConversationId>
    <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
    <eb:Action>RCMR_IN030000UK06</eb:Action>
    <eb:MessageData>
        <eb:MessageId>${messageId}</eb:MessageId>
        <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
    </eb:MessageData>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
------=_MIME-Boundary
Content-Type: application/xml
Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
Content-Transfer-Encoding: 8bit
<RCMR_IN030000UK06>
<id root="${messageId}"/>
<communicationFunctionRcv typeCode="RCV">
    <device classCode="DEV" determinerCode="INSTANCE">
        <id extension="${config.deductionsAsid}" root="1.2.826.0.1285.0.2.0.107"/>
    </device>
</communicationFunctionRcv>
<communicationFunctionSnd typeCode="SND">
    <device classCode="DEV" determinerCode="INSTANCE">
    </device>
</communicationFunctionSnd>
</RCMR_IN030000UK06>
------=_MIME-Boundary--`;

export const negativeAcknowledgement = `
------=_MIME-Boundary
<SOAP-ENV:Envelope>
  <SOAP-ENV:Header>
    <eb:CPAId>S2036482A2160104</eb:CPAId>
    <eb:ConversationId>${conversationId}</eb:ConversationId>
    <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
    <eb:Action>MCCI_IN010000UK13</eb:Action>
    <eb:MessageData>
        <eb:MessageId>${messageId}</eb:MessageId>
        <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
    </eb:MessageData>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
------=_MIME-Boundary
Content-Type: application/xml
Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
Content-Transfer-Encoding: 8bit
<MCCI_IN010000UK13>
<eb:id root="${messageId}"/>
<eb:acknowledgement typeCode="AR">
    <eb:acknowledgementDetail typeCode="ER">
        <eb:code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.32" code="519"
              displayName="hl7:{interactionId}/hl7:communicationFunctionRcv/hl7:device/hl7:id[@root=2.16.840.1.113883.2.1.3.2.4.10] is not [1..1], or is inconsistent with the SOAP:Header"/>
    </eb:acknowledgementDetail>
    <eb:messageRef>
        <eb:id root="kjhidsfg-fdgdfg-dfgdg"/>
    </eb:messageRef>
</eb:acknowledgement>
<eb:communicationFunctionRcv typeCode="RCV">
    <eb:device classCode="DEV" determinerCode="INSTANCE">
        <eb:id extension="${config.deductionsAsid}" root="1.2.826.0.1285.0.2.0.107"/>
    </eb:device>
</eb:communicationFunctionRcv>
<eb:communicationFunctionSnd typeCode="SND">
    <eb:device classCode="DEV" determinerCode="INSTANCE">
        <eb:id extension="${foundationSupplierAsid}" root="1.2.826.0.1285.0.2.0.107"/>
    </eb:device>
</eb:communicationFunctionSnd>
</MCCI_IN010000UK13>
------=_MIME-Boundary--`;
