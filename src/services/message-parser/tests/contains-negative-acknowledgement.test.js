import { containsNegativeAcknowledgement } from '../contains-negative-acknowledgement';

// Not that in a real example this acknowledgement is not prefixed with eb: as in the implementation - to clarify
describe('containsNegativeAcknowledgement', () => {
  const realExample = `
    <COPC_IN000001UK01 xmlns="urn:hl7-org:v3">
      <ControlActEvent classCode="CACT" moodCode="EVN">
        <subject typeCode="SUBJ" contextConductionInd="false">
            <pertinentInformation typeCode="PERT">
              <pertinentPayloadBody moodCode="EVN" classCode="OBS">
                <value>
                  <gp:Gp2gpfragment>
                    <Message xmlns="urn:hl7-org:v3" type="Message">
                      <eb:acknowledgement typeCode="AR">
                        <acknowledgementDetail typeCode="IF">
                          <code code="0" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.101" displayName="Continue"/>
                        </acknowledgementDetail>
                        <messageRef>
                          <id root="6E242658-3D8E-11E3-A7DC-172BDA00FA67"/>
                        </messageRef>
                      </eb:acknowledgement>
                    </Message>
                  </gp:Gp2gpfragment>
                </value>
              </pertinentPayloadBody>
            </pertinentInformation>
        </subject>
      </ControlActEvent>
    </COPC_IN000001UK01>
    `;

  const exampleNACK_1 = `
        <eb:Body>
            <eb:acknowledgement typeCode="AR">
        </eb:Body>
    `;

  const exampleNACK_2 = `
        <eb:Body>
            <eb:acknowledgement typeCode="AE">
        </eb:Body>
    `;

  const notNACKExample = `
        <eb:Body>
            <eb:acknowledgement typeCode="APE">
        </eb:Body>
    `;

  it('should contain negative acknowledgement (AR)', () => {
    expect(containsNegativeAcknowledgement(exampleNACK_1)).toBeTruthy();
  });

  it('should contain negative acknowledgement (AE)', () => {
    expect(containsNegativeAcknowledgement(exampleNACK_2)).toBeTruthy();
  });

  it('should contain negative acknowledgement (AR) in a real example', () => {
    expect(containsNegativeAcknowledgement(realExample)).toBeTruthy();
  });

  it('should not contain negative acknowledgement', () => {
    expect(containsNegativeAcknowledgement(notNACKExample)).toBeFalsy();
  });
});
