import nock from 'nock';
import { getPracticeAsid } from '../sds-fhir-client';
import { initializeConfig } from '../../../config';

jest.mock('../../../config');

describe('sds-fhir-client', () => {
  const sdsFhirUrl = 'http://localhost';
  const sdsFhirApiKey = 'key';
  const odsCode = 'A123456';
  const serviceId = 'urn:nhs:names:services:gp2gp:RCMR_IN010000UK05';
  const expectedAsid = '123456789012';
  initializeConfig.mockReturnValue({ sdsFhirUrl, sdsFhirApiKey });
  const mockResponse = {
    entry: [
      {
        resource: {
          identifier: [
            {
              system: 'https://fhir.nhs.uk/Id/nhsSpineASID',
              value: expectedAsid
            },
            {
              system: 'https://fake-fhir',
              value: 'B12345-836483'
            }
          ]
        }
      }
    ]
  };

  it('should make request to SDS FHIR URL and return ASID', async () => {
    const scope = nock(sdsFhirUrl, {
      reqheaders: {
        apiKey: sdsFhirApiKey
      }
    })
      .get(`/Device`)
      .query({
        organization: `https://fhir.nhs.uk/Id/ods-organization-code|${odsCode}`,
        identifier: `https://fhir.nhs.uk/Id/nhsServiceInteractionId|${serviceId}`
      })
      .reply(200, mockResponse);

    const response = await getPracticeAsid(odsCode, serviceId);

    expect(scope.isDone()).toBe(true);
    expect(response).toBe(expectedAsid);
  });

  it('should throw an error when a status other than 200 is received', async () => {
    const scope = nock(sdsFhirUrl, {
      reqheaders: {
        apiKey: sdsFhirApiKey
      }
    })
      .get(`/Device`)
      .query({
        organization: `https://fhir.nhs.uk/Id/ods-organization-code|${odsCode}`,
        identifier: `https://fhir.nhs.uk/Id/nhsServiceInteractionId|${serviceId}`
      })
      .reply(500);

    await expect(getPracticeAsid(odsCode, serviceId)).rejects.toThrow(
      `Failed to retrieve ASID from FHIR for ODS Code: ${odsCode} with Status: 500`
    );
    expect(scope.isDone()).toBe(true);
  });
});
