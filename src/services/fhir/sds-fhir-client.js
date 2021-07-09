import axios from 'axios';
import { initializeConfig } from '../../config';

export const getPracticeAsid = async (odsCode, serviceId) => {
  const { sdsFhirUrl, sdsFhirApiKey } = initializeConfig();
  try {
    const response = await axios.get(`${sdsFhirUrl}/Device`, {
      params: {
        organization: `https://fhir.nhs.uk/Id/ods-organization-code|${odsCode}`,
        identifier: `https://fhir.nhs.uk/Id/nhsServiceInteractionId|${serviceId}`
      },
      headers: {
        apiKey: sdsFhirApiKey
      }
    });

    const identifiers = response.data.entry[0].resource.identifier;
    const asidIdentifier = identifiers.filter(
      identifier => identifier.system === 'https://fhir.nhs.uk/Id/nhsSpineASID'
    );
    return asidIdentifier[0].value;
  } catch (err) {
    throw new Error(
      `Failed to retrieve ASID from FHIR for ODS Code: ${odsCode} with Status: ${err.response.status}`
    );
  }
};
