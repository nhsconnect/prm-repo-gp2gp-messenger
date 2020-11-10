import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { healthRecordRequests, healthRecordRequestValidation } from './health-record-requests';
import { sendEhrAcknowledgement, acknowledgementValidation } from './acknowledgement';

const healthRecordRequestRouter = express.Router();

healthRecordRequestRouter.post(
  '/:nhsNumber',
  authenticateRequest,
  healthRecordRequestValidation,
  validate,
  healthRecordRequests
);

healthRecordRequestRouter.post(
  '/:nhsNumber/acknowledgement',
  authenticateRequest,
  acknowledgementValidation,
  validate,
  sendEhrAcknowledgement
);

export { healthRecordRequestRouter };
