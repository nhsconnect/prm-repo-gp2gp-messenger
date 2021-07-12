import { initializeConfig } from '../../config';
import { getPracticeAsidViaMhs } from '../mhs/mhs-route-client';
import { getPracticeAsidViaFhir } from '../fhir/sds-fhir-client';

export const getPracticeAsid = async (practiceOdsCode, serviceId) => {
  const { toggleUseSdsFhir } = initializeConfig();
  if (toggleUseSdsFhir) {
    return await getPracticeAsidViaFhir(practiceOdsCode, serviceId);
  }
  return await getPracticeAsidViaMhs(practiceOdsCode, serviceId);
};
