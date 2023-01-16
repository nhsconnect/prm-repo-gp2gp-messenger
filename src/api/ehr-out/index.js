import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { ehrOutTransfers } from './ehr-out-transfers';

export const ehrOutRouter = express.Router();

ehrOutRouter.post('/core', authenticateRequest, validate, ehrOutTransfers);
