import express from 'express';
import { param } from 'express-validator';
import { checkIsAuthenticated } from '../middleware/auth';
import { updateLogEventWithError } from '../middleware/logging';
import { validate } from '../middleware/validation';

const router = express.Router();

const validationRules = [
  param('nhsNumber')
    .isNumeric()
    .withMessage("'nhsNumber' provided is not numeric"),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters")
];

router.post(
  '/:serialChangeNum/:pdsId/:nhsNumber',
  checkIsAuthenticated,
  validationRules,
  validate,
  async (req, res, next) => {
    try {
      res.sendStatus(200);
      next();
    } catch (err) {
      updateLogEventWithError(err);
      res.status(503).json({
        errors: err.message
      });
    }
  }
);

export default router;
