import express from 'express';
import { body } from 'express-validator';
import { checkIsAuthenticated } from '../middleware/auth';
import { validate } from '../middleware/validation';
import sendEhrRequest from '../services/ehr-request';
import MhsError from '../services/MhsError';

const router = express.Router();

const ehrRequestValidationRules = [body('nhsNumber').notEmpty(), body('odsCode').notEmpty()];

router.post('/', checkIsAuthenticated, ehrRequestValidationRules, validate, (req, res, next) => {
  sendEhrRequest(req.body.nhsNumber, req.body.odsCode)
    .then(() => res.sendStatus(202))
    .catch(err => {
      if (err instanceof MhsError) {
        return res.status(503).json({ error: err.message });
      }

      next(err);
    });
});

export default router;
