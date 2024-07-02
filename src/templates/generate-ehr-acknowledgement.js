import dateFormat from 'dateformat';
import {logInfo} from "../middleware/logging";

export const buildEhrAcknowledgementPayload = ({
  acknowledgementMessageId,
  receivingAsid,
  sendingAsid,
  acknowledgedMessageId,
  errorCode
}) => {
  const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
  let acknowledgementTypeCode;
  let controlActEventReason;

  switch (errorCode) {
    case null:
      logInfo('Building positive acknowledgement message with typeCode: AA');
      acknowledgementTypeCode = 'AA'; // positive ACK
      break;
    case '30':
    case '99':
      logInfo(`Building negative acknowledgement message with typeCode: AE and errorCode: ${errorCode}`);
      acknowledgementTypeCode = 'AE'; // negative ACK, unknown failure reason
      controlActEventReason = controlActEventReasonTemplate(errorCode);
      break;
    default: // negative ACK, known failure reason
      logInfo(`Building negative acknowledgement message with typeCode: AR and errorCode: ${errorCode}`);
      acknowledgementTypeCode = 'AR';
      controlActEventReason = controlActEventReasonTemplate(errorCode);
  }

  return ackMessageTemplate({
    acknowledgementMessageId: acknowledgementMessageId.toUpperCase(),
    timestamp,
    acknowledgementTypeCode: acknowledgementTypeCode,
    acknowledgedMessageId: acknowledgedMessageId.toUpperCase(),
    receivingAsid,
    sendingAsid,
    controlActEventReason
  });
};

const controlActEventReasonTemplate = errorCode =>
  // TODO PRMP-534 identify what the 'codeSystem' codes need to be. is it the sending/receiving ASID?
  `<reason typeCode="RSON">
     <justifyingDetectedIssueEvent classCode="ALRT" moodCode="EVN">
        <code code="${errorCode}" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.101">
           <qualifier>
              <value code="ER" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.104" />
           </qualifier>
        </code>
     </justifyingDetectedIssueEvent>
  </reason>`;

const ackMessageTemplate = ({
  acknowledgementMessageId,
  timestamp,
  acknowledgementTypeCode,
  acknowledgedMessageId,
  receivingAsid,
  sendingAsid,
  controlActEventReason // will be null in the case of positive ack
}) =>
  `<MCCI_IN010000UK13 xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 ..SchemasMCCI_IN010000UK13.xsd">
   <id root="${acknowledgementMessageId}" />
   <creationTime value="${timestamp}" />
   <versionCode code="V3NPfIT4.2.00" />
   <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="MCCI_IN010000UK13" />
   <processingCode code="P" />
   <processingModeCode code="T" />
   <acceptAckCode code="NE" />
   <acknowledgement typeCode=${acknowledgementTypeCode}>
      <messageRef>
         <id root="${acknowledgedMessageId}" />
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
      ${controlActEventReason}
      <author1 typeCode="AUT">
         <AgentSystemSDS classCode="AGNT">
            <agentSystemSDS classCode="DEV" determinerCode="INSTANCE">
               <id root="1.2.826.0.1285.0.2.0.107" extension="${sendingAsid}" />
            </agentSystemSDS>
         </AgentSystemSDS>
      </author1>
   </ControlActEvent>
</MCCI_IN010000UK13>`;
