export const checkIsAuthenticated = (req, res, next) => {
  const validAuthorizationKeys = process.env.AUTHORIZATION_KEYS
    ? process.env.AUTHORIZATION_KEYS.split(',')
    : [];

  const authorizationKey = req.get('Authorization');
  if (!authorizationKey) {
    res.sendStatus(401);
    return;
  }

  if (!validAuthorizationKeys.includes(authorizationKey)) {
    res.sendStatus(403);
    return;
  }

  next();
};
