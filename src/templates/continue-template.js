export const generateContinueRequest = (
  id,
  timestamp,
  receivingAsid,
  sendingAsid,
  ehrId
) => `<COPC_IN000001UK01 xmlns="urn:hl7-org:v3">
    <id root="${id}"/>
    <creationTime value="${timestamp}"/>
    <versionCode code="V3NPfIT3.0"/>
    <interactionId extension="COPC_IN000001UK01" root="2.16.840.1.113883.2.1.3.2.4.12"/>
    <processingCode code="P"/>
    <processingModeCode code="T"/>
    <acceptAckCode code="NE"/>
    <communicationFunctionRcv typeCode="RCV">
        <device classCode="DEV" determinerCode="INSTANCE">
            <id extension="${receivingAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </device>
    </communicationFunctionRcv>
    <communicationFunctionSnd typeCode="SND">
        <device classCode="DEV" determinerCode="INSTANCE">
            <id extension="${sendingAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </device>
    </communicationFunctionSnd>
    <ControlActEvent classCode="CACT" moodCode="EVN">
        <author1>
            <AgentSystemSDS>
                <agentSystemSDS classCode="DEV" determinerCode="INSTANCE">
                    <id extension="${sendingAsid}" root="1.2.826.0.1285.0.2.0.107"/>
                </agentSystemSDS>
            </AgentSystemSDS>
        </author1>
        <subject contextConductionInd="false" typeCode="SUBJ">
            <PayloadInformation xmlns:npfitlc="NPFIT:HL7:Localisation" classCode="OBS" moodCode="EVN">
                <code code="GP2GP_PI" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.202" displayName="GP2GP Payload Information"/>
                <id root="${id}"/>
                <npfitlc:messageType extension="COPC_MT000001UK01" root="2.16.840.1.113883.2.1.3.2.4.18.17"/>
                <value>
                    <Gp2gpfragment xmlns="urn:nhs:names:services:gp2gp">
                        <Version>01</Version>
                        <Recipients>
                            <Recipient/>
                        </Recipients>
                        <From/>
                        <subject>Continue Acknowledgement</subject>
                        <message-id>${id}</message-id>
                    </Gp2gpfragment>
                </value>
                <pertinentInformation typeCode="PERT">
                    <sequenceNumber value="1"/>
                    <pertinentPayloadBody classCode="OBS" moodCode="EVN">
                        <code code="GP2GP_PB" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.202" displayName="GP2GP Payload Body"/>
                        <id root="${id}"/>
                        <value>
                            <Gp2gpfragment>
                                <Message xmlns="urn:hl7-org:v3" type="Message">
                                    <id root="${id}"/>
                                    <code code="0" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.101" displayName="Continue"/>
                                    <creationTime value="${timestamp}"/>
                                    <versionCode code="V3NPfIT3.1.09"/>
                                    <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="MCCI_IN010000UK13"/>
                                    <processingCode code="P"/>
                                    <processingModeCode code="T"/>
                                    <acceptAckCode code="NE"/>
                                    <acknowledgement typeCode="AR">
                                        <acknowledgementDetail typeCode="IF">
                                            <code code="0" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.101" displayName="Continue"/>
                                        </acknowledgementDetail>
                                        <messageRef>
                                            <id root="${ehrId}"/>
                                        </messageRef>
                                    </acknowledgement>
                                    <communicationFunctionRcv typeCode="RCV">
                                        <device classCode="DEV" determinerCode="INSTANCE">
                                            <id extension="${receivingAsid}" root="1.2.826.0.1285.0.2.0.107"/>
                                        </device>
                                    </communicationFunctionRcv>
                                    <communicationFunctionSnd typeCode="SND">
                                        <device classCode="DEV" determinerCode="INSTANCE">
                                            <id extension="${sendingAsid}" root="1.2.826.0.1285.0.2.0.107"/>
                                        </device>
                                    </communicationFunctionSnd>
                                </Message>
                                <acknowledgedMessage>
                                    <id root="${ehrId}"/>
                                </acknowledgedMessage>
                            </Gp2gpfragment>
                        </value>
                    </pertinentPayloadBody>
                </pertinentInformation>
            </PayloadInformation>
        </subject>
    </ControlActEvent>
</COPC_IN000001UK01>`;
