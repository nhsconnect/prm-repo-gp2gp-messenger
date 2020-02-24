import dateFormat from 'dateformat';
import express from 'express';
import { param } from 'express-validator';
import uuid from 'uuid/v4';
import config from '../config';
import { checkIsAuthenticated } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { sendMessage } from '../services/mhs-service';
import generatePdsRetrievalQuery from '../templates/generate-pds-retrieval-request';
const router = express.Router();

const validationRules = [
  param('nhsNumber')
    .isNumeric()
    .withMessage("'nhsNumber' provided is not numeric"),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters")
];

router.get('/:nhsNumber', checkIsAuthenticated, validationRules, validate, (req, res, next) => {
  const interactionId = 'QUPA_IN000008UK02';
  const conversationId = uuid().toUpperCase();

  // TODO - error handling with generatePdsRetrievalQuery
  const message = generatePdsRetrievalQuery({
    id: conversationId,
    timestamp: dateFormat(Date.now(), 'yyyymmddHHMMss'),
    receivingService: { asid: config.pdsAsid },
    sendingService: { asid: config.deductionsAsid },
    patient: { nhsNumber: req.param('nhsNumber') }
  });

  sendMessage({ interactionId, conversationId, message })
    .then(() => {
      res.sendStatus(200);
      next();
    })
    .catch(err => {
      res.status(503).json({
        errors: err.message
      });
    });
});

export default router;
