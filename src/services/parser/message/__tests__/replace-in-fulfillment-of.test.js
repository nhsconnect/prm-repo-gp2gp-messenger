import { replaceInFulfillmentOf } from '../replace-in-fulfillment-of';
import { v4 } from 'uuid';

export const templateEhrExtract = priorEhrRequestId => `<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 ..SchemasRCMR_IN030000UK06.xsd">
   <id root="31FA3430-6E88-11EA-9384-E83935108FD5" />
   <creationTime value="20200325110302" />
   <versionCode code="V3NPfIT3.1.10" />
   <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="RCMR_IN030000UK06" />
   <processingCode code="P" />
   <processingModeCode code="T" />
   <acceptAckCode code="NE" />
   <communicationFunctionRcv typeCode="RCV">
      <device classCode="DEV" determinerCode="INSTANCE">
         <id root="1.2.826.0.1285.0.2.0.107" extension="200000001161" />
      </device>
   </communicationFunctionRcv>
   <communicationFunctionSnd typeCode="SND">
      <device classCode="DEV" determinerCode="INSTANCE">
         <id root="1.2.826.0.1285.0.2.0.107" extension="200000000149" />
      </device>
   </communicationFunctionSnd>
   <ControlActEvent classCode="CACT" moodCode="EVN">
      <author1 typeCode="AUT">
         <AgentSystemSDS classCode="AGNT">
            <agentSystemSDS classCode="DEV" determinerCode="INSTANCE">
               <id root="1.2.826.0.1285.0.2.0.107" extension="200000000149" />
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

describe('Replace inFulfillmentOf ehr request id', () => {
  it('should use the new ehr request id', async () => {
    const originalEhrExtract = templateEhrExtract('BBBBA01A-A9D1-A411-F824-9F7A00A33757');
    let newEhrRequestId = v4();
    const expectedEhrExtract = templateEhrExtract(newEhrRequestId);

    const newEhrExtract = await replaceInFulfillmentOf(originalEhrExtract, newEhrRequestId);

    expect(newEhrExtract).toEqual(expectedEhrExtract);
  });
});
