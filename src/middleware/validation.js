import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const mappedErrors = errors.array().map(err => ({ [err.param]: err.msg }));
  return res.status(422).json({
    errors: mappedErrors
  });
};
