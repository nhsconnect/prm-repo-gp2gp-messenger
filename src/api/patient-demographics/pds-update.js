import dateFormat from 'dateformat';
import { body, param } from 'express-validator';
import { v4 as uuid } from 'uuid';
import config from '../../config';
import { updateLogEvent, updateLogEventWithError } from '../../middleware/logging';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import generateUpdateOdsRequest from '../../templates/generate-update-ods-request';

export const pdsUpdateValidation = [
  param('nhsNumber')
    .isNumeric()
    .withMessage(`'nhsNumber' provided is not numeric`),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters"),
  body('serialChangeNumber')
    .isNumeric()
    .withMessage(`'serialChangeNumber' provided is not numeric`),
  body('serialChangeNumber')
    .not()
    .isEmpty()
    .withMessage(`'serialChangeNumber' has not been provided`),
  body('pdsId')
    .not()
    .isEmpty()
    .withMessage(`'pdsId' has not been provided`)
];

export const pdsUpdate = async (req, res, next) => {
  try {
    const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
    const interactionId = 'PRPA_IN000203UK03';
    const conversationId = uuid().toUpperCase();

    const message = await generateUpdateOdsRequest({
      id: conversationId,
      timestamp,
      receivingService: { asid: config.pdsAsid },
      sendingService: { asid: config.deductionsAsid, odsCode: config.deductionsOdsCode },
      patient: {
        nhsNumber: req.params.nhsNumber,
        pdsId: req.body.pdsId,
        pdsUpdateChangeNumber: req.body.serialChangeNumber
      }
    });

    const messageResponse = await sendMessage({
      interactionId,
      conversationId,
      message
    });

    switch (messageResponse.status) {
      case 202:
        updateLogEvent({
          status: '200 PDS Update response received',
          conversationId,
          response: messageResponse
        });
        res.status(204).json(messageResponse.data);
        break;
      case 500:
        throw new Error(`MHS Error: ${messageResponse.data}`);
      default:
        throw new Error(`Unexpected Error - HTTP code: ${messageResponse.status}`);
    }
    next();
  } catch (err) {
    updateLogEventWithError(err);
    res.status(503).json({
      errors: err.message
    });
  }
};
