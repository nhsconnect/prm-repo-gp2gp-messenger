import { handlePdsResponse } from '../pds-response-handler';

jest.mock('../../parser/soap');

const testSerialChangeNumber = '2';
const testPatientPdsId = 'cppz';
const testOdsCode = 'B12345';
const normalResponse = `
<PDSResponse xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" classCode="OBS" moodCode="EVN" xsi:schemaLocation="urn:hl7-org:v3 ../../Schemas/PRPA_MT000201UK03.xsd">
      <pertinentSerialChangeNumber classCode="OBS" moodCode="EVN">
        <code code="2" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.35"/>
        <value value="${testSerialChangeNumber}"/>
      </pertinentSerialChangeNumber>
    <patientCareProvisionEvent classCode="PCPR" moodCode="EVN">
      <code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.37" code="1"/>
      <effectiveTime>
        <low value="20140212"/>
      </effectiveTime>
      <id root="2.16.840.1.113883.2.1.3.2.4.18.1" extension="${testPatientPdsId}"/>
      <performer typeCode="PRF">
        <assignedEntity classCode="ASSIGNED">
            <id root="2.16.840.1.113883.2.1.4.3" extension="${testOdsCode}"/>
        </assignedEntity>
      </performer>
    </patientCareProvisionEvent>
</PDSResponse>`;

const noOdsCode = `
<PDSResponse xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" classCode="OBS" moodCode="EVN" xsi:schemaLocation="urn:hl7-org:v3 ../../Schemas/PRPA_MT000201UK03.xsd">
      <pertinentSerialChangeNumber classCode="OBS" moodCode="EVN">
        <code code="2" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.35"/>
        <value value="${testSerialChangeNumber}"/>
      </pertinentSerialChangeNumber>
    <patientCareProvisionEvent classCode="PCPR" moodCode="EVN">
      <code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.37" code="1"/>
      <effectiveTime>
        <low value="20140212"/>
      </effectiveTime>
      <id root="2.16.840.1.113883.2.1.3.2.4.18.1" extension="${testPatientPdsId}"/>
    </patientCareProvisionEvent>
</PDSResponse>`;

const noPDSId = `
<PDSResponse xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" classCode="OBS" moodCode="EVN" xsi:schemaLocation="urn:hl7-org:v3 ../../Schemas/PRPA_MT000201UK03.xsd">
      <pertinentSerialChangeNumber classCode="OBS" moodCode="EVN">
        <code code="2" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.35"/>
        <value value="${testSerialChangeNumber}"/>
      </pertinentSerialChangeNumber>
</PDSResponse>`;

const noSerialChangeNumber = `
<PDSResponse xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" classCode="OBS" moodCode="EVN" xsi:schemaLocation="urn:hl7-org:v3 ../../Schemas/PRPA_MT000201UK03.xsd">
    <patientCareProvisionEvent classCode="PCPR" moodCode="EVN">
      <code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.37" code="1"/>
      <effectiveTime>
        <low value="20140212"/>
      </effectiveTime>
      <id root="2.16.840.1.113883.2.1.3.2.4.18.1" extension="${testPatientPdsId}"/>
    </patientCareProvisionEvent>
</PDSResponse>`;

describe('pds-response-handler', () => {
  describe('handlePdsResponse', () => {
    it('should return an object has serial change number and patient pds id', () => {
      return expect(handlePdsResponse(normalResponse)).resolves.toEqual(
        expect.objectContaining({
          serialChangeNumber: testSerialChangeNumber,
          patientPdsId: testPatientPdsId,
          odsCode: testOdsCode
        })
      );
    });

    it('should throw error if failed to extract patient pds id', () => {
      return expect(handlePdsResponse(noPDSId)).rejects.toEqual(Error('Failed to extract PDS ID'));
    });

    it('should throw error if failed to extract patient ods code', () => {
      return expect(handlePdsResponse(noOdsCode)).rejects.toEqual(
        Error('Failed to extract ODS Code')
      );
    });

    it('should throw error if failed to extract serial change number', () => {
      return expect(handlePdsResponse(noSerialChangeNumber)).rejects.toEqual(
        Error('failed to extract PDS serial change number')
      );
    });
  });
});
