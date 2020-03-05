import { extractPdsId } from '../extract-pds.id';

describe('extractPdsId', () => {
  const testPdsId = 'cppz';

  const pdsResponseWithPdsId = `
    <patientCareProvisionEvent classCode="PCPR" moodCode="EVN">
      <code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.37" code="1"/>
      <effectiveTime>
        <low value="20140212"/>
      </effectiveTime>
      <id root="2.16.840.1.113883.2.1.3.2.4.18.1" extension="${testPdsId}"/>
    </patientCareProvisionEvent>
    `;

  const multiplePatientCareProvisionEventsWithNoneGP = `
    <playedOtherProviderPatient classCode="PAT">
      <patientCareProvisionEvent classCode="PCPR" moodCode="EVN">
        <code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.37" code="P1"/>
        <effectiveTime>
          <low value="20140212"/>
        </effectiveTime>
        <id root="2.16.840.1.113883.2.1.3.2.4.18.1" extension="6E1AE621"/>
      </patientCareProvisionEvent>
      <patientCareProvisionEvent classCode="PCPR" moodCode="EVN">
        <code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.37" code="1"/>
        <effectiveTime>
          <low value="20140212"/>
        </effectiveTime>
        <id root="2.16.840.1.113883.2.1.3.2.4.18.1" extension="${testPdsId}"/>
      </patientCareProvisionEvent>
      <patientCareProvisionEvent classCode="PCPR" moodCode="EVN">
        <code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.37" code="1"/>
        <effectiveTime>
          <low value="20140212"/>
        </effectiveTime>
        <id root="2.16.840.1.113883.2.1.3.2.4.18.1" extension="${testPdsId}"/>
      </patientCareProvisionEvent>
    </playedOtherProviderPatient>
    `;

  const noPatientCareProvisionEvent = `
      <playedOtherProviderPatient classCode="PAT">
      </playedOtherProviderPatient>
  `;

  it('should extract the pdsId from XML body', () => {
    return extractPdsId(pdsResponseWithPdsId).then(pdsId => expect(pdsId).toEqual(testPdsId));
  });

  it('should extract the pdsId from XML body if the body contains patientCareProvisionEvent is not GP', () => {
    return extractPdsId(multiplePatientCareProvisionEventsWithNoneGP).then(pdsId =>
      expect(pdsId).toEqual(testPdsId)
    );
  });

  it('should throw error if it could not extract the pds id ', () => {
    return extractPdsId(noPatientCareProvisionEvent).catch(err =>
      expect(err.message).toEqual('failed to extract PDS Id')
    );
  });
});
