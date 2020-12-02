import { validationResult } from 'express-validator';
import { logError, logEvent } from './logging';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    logEvent('validation-passed');
    return next();
  }

  const mappedErrors = errors.array().map(err => ({ [err.param]: err.msg }));
  logError('validation-failed', {
    errors: mappedErrors
  });
  return res.status(422).json({
    errors: mappedErrors
  });
};
