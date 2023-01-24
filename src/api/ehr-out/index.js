import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { sendCoreMessage, sendCoreMessageValidation } from './send-core-message';

export const ehrOutRouter = express.Router();

ehrOutRouter.post(
  '/core',
  authenticateRequest,
  sendCoreMessageValidation,
  validate,
  sendCoreMessage
);
