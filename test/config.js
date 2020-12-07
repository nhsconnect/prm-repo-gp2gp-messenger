export const config = {
  nhsEnvironment: process.env.NHS_ENVIRONMENT,
  gp2gpAdaptorUrl: process.env.SERVICE_URL, // FIXME: rename to add prefix
  gp2gpAdaptorAuthorizationKeys: process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS
};
