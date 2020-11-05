import axios from 'axios';
import { initialiseConfig } from '../../config';

export const getPracticeAsid = async odsCode => {
  const INTERACTION_ID = 'urn:nhs:names:services:gp2gp:RCMR_IN010000UK05';
  const baseUrl = initialiseConfig().mhsRouteUrl.replace(/\/$/, '');
  const url = `${baseUrl}/routing`;

  const res = await axios.get(url, {
    params: {
      'org-code': odsCode,
      'service-id': INTERACTION_ID
    }
  });

  if (res.status !== 200) {
    throw new Error(`MHS failed to provide ASID for ODS code ${odsCode}`);
  }

  const asids = res.data.uniqueIdentifier;

  if (asids.length === 0) {
    throw new Error(`No ASID found for ODS code ${odsCode}`);
  }

  if (asids.length > 1) {
    throw new Error(`Multiple ASIDs found for ODS code ${odsCode}`);
  }

  return asids[0];
};
