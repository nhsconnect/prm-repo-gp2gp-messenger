import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { healthRecordTransfers, healthRecordTransferValidation } from './health-record-transfers';

export const healthRecordTransferRouter = express.Router();

healthRecordTransferRouter.post(
  '/',
  authenticateRequest,
  healthRecordTransferValidation,
  validate,
  healthRecordTransfers
);
