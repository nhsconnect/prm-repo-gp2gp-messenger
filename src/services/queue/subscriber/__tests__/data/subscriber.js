import config from '../../../../../config';

export const nhsNumber = '9465731285';
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
          <eb:Manifest eb:version="2.0">
              <eb:Reference eb:id="_FE6A40B9-F4C6-4041-A306-EA2A149411CD" xlink:href="cid:FE6A40B9-F4C6-4041-A306-EA2A149411CD@inps.co.uk/Vision/3">
                  <eb:Description xml:lang="en-GB">COPC_IN000001UK01</eb:Description>
              </eb:Reference>
          </eb:Manifest>
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
    <patient classCode="PAT">
        <id extension="${nhsNumber}" root="2.16.840.1.113883.2.1.4.1"/>
    </patient>
  </RCMR_IN030000UK06>

  ------=_MIME-Boundary--`;

export const unhandledInteractionId = `------=_MIME-Boundary
Content-Type: application/xml
Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
Content-Transfer-Encoding: 8bit

<SOAP-ENV:Envelope>
  <SOAP-ENV:Header>
    <eb:CPAId>S2036482A2160104</eb:CPAId>
    <eb:ConversationId>${conversationId}</eb:ConversationId>
    <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
    <eb:Action>FAKE_IN030000UK06</eb:Action>
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

  <FAKE_IN030000UK06>
    <id root="${messageId}"/>
  </FAKE_IN030000UK06>
  ------=_MIME-Boundary--`;

export const pdsGeneralUpdateRequestAcceptedMessage = `------=_MIME-Boundary
Content-Type: application/xml
Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
Content-Transfer-Encoding: 8bit

<SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:ConversationId>${conversationId}</eb:ConversationId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:Action>PRPA_IN000202UK01</eb:Action>
        <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
          <eb:Manifest eb:version="2.0">
              <eb:Reference eb:id="_FE6A40B9-F4C6-4041-A306-EA2A149411CD" xlink:href="cid:FE6A40B9-F4C6-4041-A306-EA2A149411CD@inps.co.uk/Vision/3">
                  <eb:Description xml:lang="en-GB">COPC_IN000001UK01</eb:Description>
              </eb:Reference>
          </eb:Manifest>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>

    ------=_MIME-Boundary
  Content-Type: application/xml
  Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
  Content-Transfer-Encoding: 8bit

  <PRPA_IN000202UK01>
    <id root="${messageId}"/>
  </PRPA_IN000202UK01>

  ------=_MIME-Boundary--`;
