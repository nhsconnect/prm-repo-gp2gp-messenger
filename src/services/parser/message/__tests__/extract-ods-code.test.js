import { extractOdsCode } from '../extract-ods-code';

const exampleMessage = `<RCMR_IN010000UK05 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xs="http://www.w3.org/2001/XMLSchema"
                       type="Message" xmlns="urn:hl7-org:v3">
        <ControlActEvent type="ControlAct" classCode="CACT" moodCode="EVN">
            <subject type="ActRelationship" typeCode="SUBJ" contextConductionInd="false">
                <EhrRequest type="ActHeir" classCode="EXTRACT" moodCode="RQO">
                    <id root="041CA2AE-3EC6-4AC9-942F-0F6621CC0BFC"/>
                    <recordTarget type="Participation" typeCode="RCT">
                        <patient type="Patient" classCode="PAT">
                            <id root="2.16.840.1.113883.2.1.4.1" extension="9692294935"/>
                        </patient>
                    </recordTarget>
                    <author type="Participation" typeCode="AUT">
                        <AgentOrgSDS type="RoleHeir" classCode="AGNT">
                            <agentOrganizationSDS type="Organization" classCode="ORG" determinerCode="INSTANCE">
                                <id root="1.2.826.0.1285.0.1.10" extension="N82668"/>
                            </agentOrganizationSDS>
                        </AgentOrgSDS>
                    </author>
                </EhrRequest>
            </subject>
        </ControlActEvent>
    </RCMR_IN010000UK05>`;

const errorExampleMessage = `<RCMR_IN010000UK05></RCMR_IN010000UK05>`;

describe('extract ods code', () => {
  it('should extract ods code', () => {
    expect(extractOdsCode(exampleMessage)).resolves.toBe('N82668');
  });

  it('should get error message when cannot extract ods code', () => {
    expect(extractOdsCode(errorExampleMessage)).rejects.toEqual(
      Error(`message does not contain ods code: The key 'author' was not found in the message`)
    );
  });
});
