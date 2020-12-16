import { initializeConfig } from '../../../../../config';

const config = initializeConfig();
export const nhsNumber = '9465731285';
export const odsCode = 'N82668';
export const conversationId = 'some-conversation-id-123';
export const messageId = 'some-message-id-456';
export const foundationSupplierAsid = 'foundation-supplier-asid';
export const ehrRequestId = '041CA2AE-3EC6-4AC9-942F-0F6621CC0BFC';

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

export const ehrRequestMessage = `--e01d9133-5058-45e5-a884-9189f468c805
Content-Id:<ContentRoot>
Content-Type: text/xml; charset=UTF-8

<soap:Envelope>
        <soap:Header>
            <eb:MessageHeader eb:version="2.0" soap:mustUnderstand="1">
                <eb:CPAId>1b09c9557a7794ff6fd2</eb:CPAId>
                <eb:ConversationId>${conversationId}</eb:ConversationId>
                <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
                <eb:Action>RCMR_IN010000UK05</eb:Action>
                <eb:MessageData>
                    <eb:MessageId>${messageId}</eb:MessageId>
                    <eb:Timestamp>2020-11-16T17:13:38.682Z</eb:Timestamp>
                    <eb:TimeToLive>2020-11-16T23:28:38.682Z</eb:TimeToLive>
                </eb:MessageData>
                <eb:DuplicateElimination/>
            </eb:MessageHeader>
        </soap:Header>
        <soap:Body>
            <eb:Manifest eb:version="2.0" soap:mustUnderstand="1">
                <eb:Reference xlink:href="cid:Content1@e-mis.com/EMISWeb/GP2GP2.2A" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <eb:Description xml:lang="en">RCMR_IN010000UK05</eb:Description>
                    <hl7ebxml:Payload style="HL7" encoding="XML" version="3.0"/>
                </eb:Reference>
            </eb:Manifest>
        </soap:Body>
    </soap:Envelope>
    
--e01d9133-5058-45e5-a884-9189f468c805
Content-Id:<Content1@e-mis.com/EMISWeb/GP2GP2.2A>
Content-Transfer-Encoding: 8bit
Content-Type: application/xml; charset=UTF-8

<RCMR_IN010000UK05>
        <id root="${messageId}"/>
        <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="RCMR_IN010000UK05"/>
        <communicationFunctionRcv type="CommunicationFunction" typeCode="RCV">
            <device type="Device" classCode="DEV" determinerCode="INSTANCE">
                <id root="1.2.826.0.1285.0.2.0.107" extension="${config.deductionsAsid}"/>
            </device>
        </communicationFunctionRcv>
        <communicationFunctionSnd type="CommunicationFunction" typeCode="SND">
            <device type="Device" classCode="DEV" determinerCode="INSTANCE">
                <id root="1.2.826.0.1285.0.2.0.107" extension="${foundationSupplierAsid}"/>
            </device>
        </communicationFunctionSnd>
        <ControlActEvent type="ControlAct" classCode="CACT" moodCode="EVN">
            <subject type="ActRelationship" typeCode="SUBJ" contextConductionInd="false">
                <EhrRequest type="ActHeir" classCode="EXTRACT" moodCode="RQO">
                    <id root="${ehrRequestId}"/>
                    <recordTarget type="Participation" typeCode="RCT">
                        <patient type="Patient" classCode="PAT">
                            <id root="2.16.840.1.113883.2.1.4.1" extension="${nhsNumber}"/>
                        </patient>
                    </recordTarget>
                    <author type="Participation" typeCode="AUT">
                        <AgentOrgSDS type="RoleHeir" classCode="AGNT">
                            <agentOrganizationSDS type="Organization" classCode="ORG" determinerCode="INSTANCE">
                                <id root="1.2.826.0.1285.0.1.10" extension="${odsCode}"/>
                            </agentOrganizationSDS>
                        </AgentOrgSDS>
                    </author>
                    <destination type="Participation" typeCode="DST">
                        <AgentOrgSDS type="RoleHeir" classCode="AGNT">
                            <agentOrganizationSDS type="Organization" classCode="ORG" determinerCode="INSTANCE">
                                <id root="1.2.826.0.1285.0.1.10" extension="B86041"/>
                            </agentOrganizationSDS>
                        </AgentOrgSDS>
                    </destination>
                </EhrRequest>
            </subject>
        </ControlActEvent>
    </RCMR_IN010000UK05>
    
--e01d9133-5058-45e5-a884-9189f468c805--`;

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
