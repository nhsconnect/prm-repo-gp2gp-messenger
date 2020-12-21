import { updateExtractForSending } from '../update-extract-for-sending';
import { v4 } from 'uuid';
import 'jest-xml-matcher';
import { XmlParser } from '../../xml-parser';

export const templateEhrExtract = (
  receivingAsid,
  sendingAsid,
  priorEhrRequestId
) => `<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 ..SchemasRCMR_IN030000UK06.xsd">
   <id root="31FA3430-6E88-11EA-9384-E83935108FD5" />
   <creationTime value="20200325110302" />
   <versionCode code="V3NPfIT3.1.10" />
   <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="RCMR_IN030000UK06" />
   <processingCode code="P" />
   <processingModeCode code="T" />
   <acceptAckCode code="NE" />
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
      <subject typeCode="SUBJ" contextConductionInd="false">
         <EhrExtract classCode="EXTRACT" moodCode="EVN">
            <id root="31FA3430-6E88-11EA-9384-E83935108FD5" />
            <statusCode code="COMPLETE" />
            <availabilityTime value="20200325110302" />
            <recordTarget typeCode="RCT">
               <patient classCode="PAT">
                  <id root="2.16.840.1.113883.2.1.4.1" extension="9442964410" />
               </patient>
            </recordTarget>
            <author typeCode="AUT">
               <time value="20200325110302" />
               <AgentOrgSDS classCode="AGNT">
                  <agentOrganizationSDS classCode="ORG" determinerCode="INSTANCE">
                     <id root="1.2.826.0.1285.0.1.10" extension="M85019" />
                  </agentOrganizationSDS>
               </AgentOrgSDS>
            </author>
            <destination typeCode="DST">
               <AgentOrgSDS classCode="AGNT">
                  <agentOrganizationSDS classCode="ORG" determinerCode="INSTANCE">
                     <id root="1.2.826.0.1285.0.1.10" extension="B86041" />
                  </agentOrganizationSDS>
               </AgentOrgSDS>
            </destination>
            <inFulfillmentOf typeCode="FLFS">
               <priorEhrRequest classCode="EXTRACT" moodCode="RQO">
                  <id root="${priorEhrRequestId}" />
               </priorEhrRequest>
            </inFulfillmentOf>
         </EhrExtract>
      </subject>
   </ControlActEvent>
</RCMR_IN030000UK06>
`;

describe('updateExtractForSending', () => {
  it('should use the new ehr request id, sending asid and receiving asid', async () => {
    const oldSendingAsid = '200000000149';
    const oldReceivingAsid = '200000001161';
    const oldEhrRequestId = 'BBBBA01A-A9D1-A411-F824-9F7A00A33757';
    const originalEhrExtract = templateEhrExtract(
      oldReceivingAsid,
      oldSendingAsid,
      oldEhrRequestId
    );

    const newSendingAsid = '200000001161';
    const newReceivingAsid = '200000001162';
    const newEhrRequestId = v4();
    const expectedEhrExtract = templateEhrExtract(
      newReceivingAsid,
      newSendingAsid,
      newEhrRequestId
    );

    const newEhrExtract = await updateExtractForSending(
      originalEhrExtract,
      newEhrRequestId,
      newReceivingAsid
    );

    const parsedNewEhrExtract = await new XmlParser().parse(newEhrExtract);
    const parsedExpectedEhrExtract = await new XmlParser().parse(expectedEhrExtract);
    expect(parsedNewEhrExtract).toEqual(parsedExpectedEhrExtract);
  });
});
