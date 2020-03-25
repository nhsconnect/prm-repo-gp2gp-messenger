import { param, body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import dateFormat from 'dateformat';
import generateEhrRequestQuery from '../../templates/ehr-request-template';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';

export const healthRecordRequestValidation = [
  param('nhsNumber')
    .isNumeric()
    .withMessage(`'nhsNumber' provided is not numeric`),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 digits"),
  body('repositoryOdsCode')
    .notEmpty()
    .withMessage("'repositoryOdsCode' is not configured"),
  body('repositoryAsid')
    .notEmpty()
    .withMessage("'repositoryAsid' is not configured"),
  body('practiceOdsCode')
    .notEmpty()
    .withMessage("'practiceOdsCode' is not configured"),
  body('practiceAsid')
    .notEmpty()
    .withMessage("'practiceAsid' is not configured")
];

export const healthRecordRequests = async (req, res) => {
  const interactionId = 'RCMR_IN010000UK05';
  const conversationId = uuid().toUpperCase();

  const message = await buildEhrRequest(req, conversationId);
  try {
    await sendMessage({
      interactionId,
      conversationId,
      odsCode: req.body.practiceOdsCode,
      message
    });
    res.sendStatus(204);
  } catch (err) {
    res.status(503).send({ errors: ['Sending EHR Request has failed', err.message] });
  }
};

export const buildEhrRequest = async (req, conversationId) => {
  const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');

  return generateEhrRequestQuery({
    id: conversationId,
    timestamp,
    receivingService: {
      asid: req.body.practiceAsid,
      odsCode: req.body.practiceOdsCode
    },
    sendingService: {
      asid: req.body.repositoryAsid,
      odsCode: req.body.repositoryOdsCode
    },
    patient: {
      nhsNumber: req.params.nhsNumber
    }
  });
};
