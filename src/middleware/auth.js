import { updateLogEvent } from './logging';

export const checkIsAuthenticated = (req, res, next) => {
  const validAuthorizationKeys = process.env.AUTHORIZATION_KEYS
    ? process.env.AUTHORIZATION_KEYS.split(',')
    : [];

  const authorizationKey = req.get('Authorization');
  if (!authorizationKey) {
    updateLogEvent({
      status: 'authorization-failed',
      error: { message: 'Authorization header not provided' }
    });
    res.sendStatus(401);
    return;
  }

  if (!validAuthorizationKeys.includes(authorizationKey)) {
    updateLogEvent({
      status: 'authorization-failed',
      error: { message: 'Authorization header value is not a valid authorization key' }
    });
    res.sendStatus(403);
    return;
  }

  next();
};
