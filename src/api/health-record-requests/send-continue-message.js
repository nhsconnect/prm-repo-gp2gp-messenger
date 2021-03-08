import { body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { getPracticeAsid } from '../../services/mhs/mhs-route-client';
import { logError, logInfo } from '../../middleware/logging';
import { generateContinueRequest } from '../../templates/generate-continue-request';
import { initializeConfig } from '../../config';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';

export const continueMessageValidation = [
  body('conversationId').isUUID().withMessage("'conversationId' provided is not of type UUID"),
  body('odsCode').notEmpty().withMessage("'odsCode' has not been provided"),
  body('ehrExtractMessageId')
    .isUUID()
    .withMessage("'ehrExtractMessageId' provided is not of type UUID")
];

export const sendContinueMessage = async (req, res) => {
  const config = initializeConfig();
  const messageId = uuid();
  const interactionId = 'COPC_IN000001UK01';
  const serviceId = `urn:nhs:names:services:gp2gp:${interactionId}`;
  const { conversationId, odsCode, ehrExtractMessageId } = req.body;

  try {
    const practiceAsid = await getPracticeAsid(odsCode, serviceId);
    const message = await generateContinueRequest({
      messageId,
      receivingAsid: practiceAsid,
      sendingAsid: config.deductionsAsid,
      ehrExtractMessageId
    });
    await sendMessage({ interactionId, conversationId, odsCode, message });
    logInfo('Continue message sent to MHS');
    res.sendStatus(204);
  } catch (err) {
    logError('Could not send continue message', err);
    res.sendStatus(503);
  }
};
