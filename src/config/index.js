export const portNumber = 3000;

export const initializeConfig = () => ({
  deductionsAsid: process.env.GP2GP_ADAPTOR_REPOSITORY_ASID || '200000001161',
  deductionsOdsCode: process.env.GP2GP_ADAPTOR_REPOSITORY_ODS_CODE || 'B86041',
  gpToRepoUrl: process.env.GP2GP_ADAPTOR_GP_TO_REPO_URL,
  gpToRepoAuthKeys: process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS_FOR_GP_TO_REPO,
  repoToGpUrl: process.env.GP2GP_ADAPTOR_REPO_TO_GP_URL,
  repoToGpAuthKeys: process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS_FOR_REPO_TO_GP,
  gp2gpAdaptorAuthorizationKeys: process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS,
  pdsAsid: process.env.PDS_ASID || '928942012545',
  mhsOutboundUrl: process.env.GP2GP_ADAPTOR_MHS_OUTBOUND_URL,
  mhsRouteUrl: process.env.GP2GP_ADAPTOR_MHS_ROUTE_URL,
  nhsEnvironment: process.env.NHS_ENVIRONMENT || 'local',
  nhsNumberPrefix: process.env.NHS_NUMBER_PREFIX
});
