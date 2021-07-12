import axios from 'axios';
import { initializeConfig } from '../../config';
import { logError } from '../../middleware/logging';

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

    if (asidIdentifier.length === 0) {
      throw new Error(`No ASID found for ODS code ${odsCode}`);
    }

    if (asidIdentifier.length > 1) {
      throw new Error(`Multiple ASIDs found for ODS code ${odsCode}`);
    }

    return asidIdentifier[0].value;
  } catch (err) {
    logError(`Failed to retrieve ASID from FHIR for ODS Code: ${odsCode}`, err);
    throw err;
  }
};
