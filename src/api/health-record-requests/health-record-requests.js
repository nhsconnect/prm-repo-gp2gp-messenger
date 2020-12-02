import { param, body } from 'express-validator';
import dateFormat from 'dateformat';
import generateEhrRequestQuery from '../../templates/ehr-request-template';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import { logEvent } from '../../middleware/logging';
import { getPracticeAsid } from '../../services/mhs/mhs-route-client';

export const healthRecordRequestValidation = [
  param('nhsNumber').isNumeric().withMessage(`'nhsNumber' provided is not numeric`),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 digits"),
  body('repositoryOdsCode').notEmpty().withMessage("'repositoryOdsCode' is not configured"),
  body('repositoryAsid').notEmpty().withMessage("'repositoryAsid' is not configured"),
  body('practiceOdsCode').notEmpty().withMessage("'practiceOdsCode' is not configured"),
  body('conversationId').isUUID('4').withMessage("'conversationId' provided is not of type UUIDv4"),
  body('conversationId').notEmpty().withMessage("'conversationId' is not configured")
];

export const healthRecordRequests = async (req, res) => {
  const interactionId = 'RCMR_IN010000UK05';
  const serviceId = `urn:nhs:names:services:gp2gp:${interactionId}`;
  const conversationId = req.body.conversationId.toUpperCase();
  try {
    const asid = await getPracticeAsid(req.body.practiceOdsCode, serviceId);
    const message = await buildEhrRequest(req, conversationId, asid);

    await sendMessage({
      interactionId,
      conversationId,
      odsCode: req.body.practiceOdsCode,
      message
    });
    res.sendStatus(204);
    logEvent('EHR Request sent', { conversationId });
  } catch (err) {
    res.status(503).send({ errors: ['Sending EHR Request has failed', err.message] });
  }
};

export const buildEhrRequest = async (req, conversationId, practiceAsid) => {
  const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');

  return generateEhrRequestQuery({
    id: conversationId,
    timestamp,
    receivingService: {
      asid: practiceAsid,
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
