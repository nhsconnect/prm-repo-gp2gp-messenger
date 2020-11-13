import dateFormat from 'dateformat';

export const buildEhrAcknowledgement = ({
  conversationId,
  receivingAsid,
  sendingAsid,
  messageId
}) => {
  const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
  return ackMessageTemplate({ conversationId, timestamp, receivingAsid, sendingAsid, messageId });
};

const ackMessageTemplate = ({ conversationId, timestamp, receivingAsid, sendingAsid, messageId }) =>
  `<MCCI_IN010000UK13 xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 ..SchemasMCCI_IN010000UK13.xsd">
   <id root="${conversationId}" />
   <creationTime value="${timestamp}" />
   <versionCode code="V3NPfIT4.2.00" />
   <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="MCCI_IN010000UK13" />
   <processingCode code="P" />
   <processingModeCode code="T" />
   <acceptAckCode code="NE" />
   <acknowledgement typeCode="AA">
      <messageRef>
         <id root="${messageId}" />
      </messageRef>
   </acknowledgement>
   <communicationFunctionRcv typeCode="RCV">
      <device classCode="DEV" determinerCode="INSTANCE">
         <id root="1.2.826.0.1285.0.2.0.107" extension="${receivingAsid}" />
      </device>
   </communicationFunctionRcv>
   <communicationFunctionSnd typeCode="SND">
      <device classCode="DEV" determinerCode="INSTANCE">
         <id root="1.2.826.0.1285.0.2.0.107" extension="${sendingAsid}" />
      </device>
   </communicationFunctionSnd>
   <ControlActEvent classCode="CACT" moodCode="EVN">
      <author1 typeCode="AUT">
         <AgentSystemSDS classCode="AGNT">
            <agentSystemSDS classCode="DEV" determinerCode="INSTANCE">
               <id root="1.2.826.0.1285.0.2.0.107" extension="${sendingAsid}" />
            </agentSystemSDS>
         </AgentSystemSDS>
      </author1>
   </ControlActEvent>
</MCCI_IN010000UK13>`;
