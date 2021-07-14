export const portNumber = 3000;

export const initializeConfig = () => ({
  deductionsAsid: process.env.GP2GP_ADAPTOR_REPOSITORY_ASID,
  deductionsOdsCode: (process.env.GP2GP_ADAPTOR_REPOSITORY_ODS_CODE || '').toUpperCase(),
  e2eTestAuthorizationKeysForGp2gpAdaptor:
    process.env.E2E_TEST_AUTHORIZATION_KEYS_FOR_GP2GP_ADAPTOR,
  pdsAsid: process.env.PDS_ASID || '928942012545',
  mhsOutboundUrl: process.env.GP2GP_ADAPTOR_MHS_OUTBOUND_URL,
  mhsRouteUrl: process.env.GP2GP_ADAPTOR_MHS_ROUTE_URL,
  nhsEnvironment: process.env.NHS_ENVIRONMENT || 'local',
  nhsNumberPrefix: process.env.NHS_NUMBER_PREFIX,
  toggleUseSdsFhir: process.env.TOGGLE_USE_SDS_FHIR === 'true',
  sdsFhirApiKey: process.env.SDS_FHIR_API_KEY,
  sdsFhirUrl: process.env.SDS_FHIR_URL,
  consumerApiKeys: loadConsumerKeys()
});

const loadConsumerKeys = () => {
  const consumerObjectKeys = {};
  Object.keys(process.env).forEach(envVarName => {
    if (envVarName.startsWith('API_KEY_FOR_')) {
      const consumerName = envVarName.split('API_KEY_FOR_')[1];
      consumerObjectKeys[consumerName] = process.env[envVarName];
    }
  });
  return consumerObjectKeys;
};
