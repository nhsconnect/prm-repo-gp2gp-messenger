import dateFormat from 'dateformat';
import express from 'express';
import { param } from 'express-validator';
import uuid from 'uuid/v4';
import config from '../config';
import { checkIsAuthenticated } from '../middleware/auth';
import { updateLogEvent, updateLogEventWithError } from '../middleware/logging';
import { validate } from '../middleware/validation';
import { sendMessage } from '../services/mhs/mhs-outbound-client';
import generatePdsRetrievalQuery from '../templates/generate-pds-retrieval-request';
import { validatePdsResponse } from '../services/pds/pds-response-validator';
import { parsePdsResponse } from '../services/pds/pds-response-handler';

const router = express.Router();

const validationRules = [
  param('nhsNumber')
    .isNumeric()
    .withMessage("'nhsNumber' provided is not numeric"),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters")
];

router.get(
  '/:nhsNumber',
  checkIsAuthenticated,
  validationRules,
  validate,
  async (req, res, next) => {
    try {
      const interactionId = 'QUPA_IN000008UK02';
      const conversationId = uuid().toUpperCase();
      const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');

      const message = await generatePdsRetrievalQuery({
        id: conversationId,
        timestamp,
        receivingService: { asid: config.pdsAsid },
        sendingService: { asid: config.deductionsAsid },
        patient: { nhsNumber: req.params.nhsNumber }
      });

      if (!message.includes(interactionId)) {
        throw new Error('interactionId is not included in the message');
      }

      const messageResponse = await sendMessage({ interactionId, conversationId, message });

      switch (messageResponse.status) {
        case 200:
          updateLogEvent({
            status: '200 PDS response received',
            conversationId,
            response: messageResponse
          });
          if (messageResponse.data) {
            const isValid = await validatePdsResponse(messageResponse.data);
            if (isValid) {
              const parsedResponse = await parsePdsResponse(messageResponse.data);
              res.status(200).json(parsedResponse);
            } else {
              updateLogEventWithError(Error('Error in processing the patient retrieval request'));
              res.status(200).json({});
            }
          }
          break;
        case 500:
          throw new Error(`MHS Error: ${messageResponse.data}`);
        default:
          throw new Error(`Unexpected Error: ${messageResponse.data}`);
      }

      next();
    } catch (err) {
      updateLogEventWithError(err);
      res.status(503).json({
        errors: err.message
      });
    }
  }
);

export default router;
