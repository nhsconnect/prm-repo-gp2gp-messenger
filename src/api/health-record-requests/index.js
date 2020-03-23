import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { healthRecordRequests } from './health-record-requests';

const healthRecordRequestRouter = express.Router();

healthRecordRequestRouter.post('/:nhsNumber', authenticateRequest, healthRecordRequests);

export { healthRecordRequestRouter };
