import express from 'express';
import {authenticateRequest} from '../../middleware/auth';
import {validate} from '../../middleware/validation';
import {healthRecordTransfers, healthRecordTransferValidation} from './health-record-transfers';

export const healthRecordTransferRouter = express.Router();

healthRecordTransferRouter.post(
  '/',
  authenticateRequest,
  healthRecordTransferValidation,
  validate,
  healthRecordTransfers
);

const healthRecordTransfersFragment = async (req, res) => {
  res.sendStatus(204);
}

healthRecordTransferRouter.post(
  '/fragment',
  authenticateRequest,
  [
    // some validation
  ],
  validate,
  healthRecordTransfersFragment
);
