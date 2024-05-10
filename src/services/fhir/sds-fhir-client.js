import axios from 'axios';
import { initializeConfig } from '../../config';
import { logInfo } from '../../middleware/logging';

export const getPracticeAsid = async (odsCode, serviceId) => {
  logInfo(`Attempting to query SDS in regards to ODS code ${odsCode} to fetch the practice ASID`);

  const sdsQueryResponse = await querySds(odsCode, serviceId);
  const entries = sdsQueryResponse.data.entry;
  let asidCode = undefined;

  entries.forEach(entry => {
    entry.resource.identifier.forEach(identifier => {
      if (
        identifier.system === 'https://fhir.nhs.uk/Id/nhsMhsPartyKey' &&
        identifier.value.includes(`${odsCode}-`)
      ) {
        // If the identifier matches, store the ASID value
        asidCode = entry.resource.identifier.find(
          id => id.system === 'https://fhir.nhs.uk/Id/nhsSpineASID'
        )?.value;
      }
    });
  });

  if (asidCode === undefined) {
    throw Error(`An ASID code couldn't be found for ODS code ${odsCode}`);
  }

  return asidCode;
};

const querySds = async (odsCode, serviceId) => {
  const { sdsFhirUrl, sdsFhirApiKey } = initializeConfig();

  return await axios.get(`${sdsFhirUrl}/Device`, {
    params: {
      organization: `https://fhir.nhs.uk/Id/ods-organization-code|${odsCode}`,
      identifier: `https://fhir.nhs.uk/Id/nhsServiceInteractionId|${serviceId}`
    },
    headers: {
      apiKey: sdsFhirApiKey
    }
  });
};
