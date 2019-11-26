import express from 'express';
import { body } from 'express-validator';
import { checkIsAuthenticated } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

const ehrRequestValidationRules = [
  body('nhsNumber').notEmpty(),
  body('asid').notEmpty(),
  body('partyKey').notEmpty()
];

router.post('/', checkIsAuthenticated, ehrRequestValidationRules, validate, (req, res) => {
  res.sendStatus(202);
});

export default router;
