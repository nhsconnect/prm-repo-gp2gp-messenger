import axios from 'axios';
import { initializeConfig } from '../../config';

export const getPracticeAsid = async (odsCode, serviceId) => {
  const baseUrl = initializeConfig().mhsRouteUrl.replace(/\/$/, '');
  const url = `${baseUrl}/routing`;

  const res = await axios.get(url, {
    params: {
      'org-code': odsCode,
      'service-id': serviceId
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
