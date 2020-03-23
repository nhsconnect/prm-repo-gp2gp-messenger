import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { healthRecordRequests, healthRecordRequestValidation } from './health-record-requests';

const healthRecordRequestRouter = express.Router();

healthRecordRequestRouter.post(
  '/:nhsNumber',
  authenticateRequest,
  healthRecordRequestValidation,
  validate,
  healthRecordRequests
);

export { healthRecordRequestRouter };
