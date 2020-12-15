import { extractEhrRequestId } from '../extract-ehr-request-id';

const exampleMessage = `<RCMR_IN010000UK05 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xs="http://www.w3.org/2001/XMLSchema" type="Message" xmlns="urn:hl7-org:v3">
   <id root="DFF5321C-C6EA-468E-BBC2-B0E48000E071"/>
   <ControlActEvent type="ControlAct" classCode="CACT" moodCode="EVN">
        <author1 type="Participation" typeCode="AUT">
            <AgentSystemSDS type="RoleHeir" classCode="AGNT">
                <agentSystemSDS type="Device" classCode="DEV" determinerCode="INSTANCE">
                    <id root="1.2.826.0.1285.0.2.0.107" extension="200000000205"/>
                </agentSystemSDS>
            </AgentSystemSDS>
        </author1>
        <subject type="ActRelationship" typeCode="SUBJ" contextConductionInd="false">
            <EhrRequest type="ActHeir" classCode="EXTRACT" moodCode="RQO">
                <id root="041CA2AE-3EC6-4AC9-942F-0F6621CC0BFC"/>
            </EhrRequest>
        </subject>
   </ControlActEvent>
</RCMR_IN010000UK05>`;

const errorExampleMessage = `<RCMR_IN010000UK05></RCMR_IN010000UK05>`;

describe('extract ehr id', () => {
  it('should extract ehr id', () => {
    expect(extractEhrRequestId(exampleMessage)).resolves.toBe(
      '041CA2AE-3EC6-4AC9-942F-0F6621CC0BFC'
    );
  });

  it('should get error message when cannot extract ehr id', () => {
    expect(extractEhrRequestId(errorExampleMessage)).rejects.toEqual(
      Error(
        `Message does not contain EHR Request ID: The key 'EhrRequest' was not found in the message`
      )
    );
  });
});
