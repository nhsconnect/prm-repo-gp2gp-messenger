export const authenticateRequest = (req, res, next) => {
  if (!process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS) {
    res.status(412).json({
      error: `Server-side Authorization keys have not been set, cannot authenticate`
    });
    return;
  }
  const validAuthorizationKeys = process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS;

  const authorizationKey = req.get('Authorization');

  if (!authorizationKey) {
    res.status(401).json({
      error: `The request (${req.baseUrl}) requires a valid Authorization header to be set`
    });
    return;
  }

  if (validAuthorizationKeys !== authorizationKey) {
    res.status(403).json({
      error: `Authorization header is provided but not valid`
    });
    return;
  }

  next();
};
