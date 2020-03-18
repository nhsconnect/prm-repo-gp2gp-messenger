import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { pdsUpdateValidation, pdsUpdate } from './pds-update';
import { pdsRetrievalValidation, pdsRetrieval } from './pds-retrieval';

const patientDemographics = express.Router();

patientDemographics.patch(
  '/:nhsNumber',
  authenticateRequest,
  pdsUpdateValidation,
  validate,
  pdsUpdate
);

patientDemographics.get(
  '/:nhsNumber',
  authenticateRequest,
  pdsRetrievalValidation,
  validate,
  pdsRetrieval
);

export { patientDemographics };
