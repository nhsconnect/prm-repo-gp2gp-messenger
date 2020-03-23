import express from 'express';
import { body } from 'express-validator';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { postEhrRequest } from './ehr-request';

const ehrRequest = express.Router();

const ehrRequestValidationRules = [body('nhsNumber').notEmpty(), body('odsCode').notEmpty()];

ehrRequest.post('/', authenticateRequest, ehrRequestValidationRules, validate, postEhrRequest);

export { ehrRequest };
