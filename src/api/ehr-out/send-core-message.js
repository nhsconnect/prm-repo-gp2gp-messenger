import { setCurrentSpanAttributes } from '../../config/tracing';
import { getPracticeAsid } from '../../services/fhir/sds-fhir-client';
import { logError, logInfo } from '../../middleware/logging';
import { updateExtractForSending } from '../../services/parser/message/update-extract-for-sending';
import { initializeConfig } from '../../config/index';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import { body } from 'express-validator';

export const sendCoreMessageValidation = [
  body('conversationId').isUUID().withMessage("'conversationId' provided is not of type UUID"),
  body('odsCode').notEmpty().withMessage('Value has not been provided'),
  body('ehrRequestId').isUUID().withMessage('Provided value is not of type UUID'),
  body('coreEhr').notEmpty().withMessage('Value has not been provided')
];
export const sendCoreMessage = async (req, res) => {
  const { conversationId, odsCode, coreEhr, ehrRequestId } = req.body;
  const interactionId = 'RCMR_IN030000UK06';
  const serviceId = `urn:nhs:names:services:gp2gp:${interactionId}`;
  const repositoryOdsCode = initializeConfig().deductionsOdsCode;
  setCurrentSpanAttributes({ conversationId });

  try {
    logInfo('Getting asid for practice');
    const receivingPracticeAsid = await getPracticeAsid(odsCode, serviceId);
    logInfo('Got asid for practice and its ' + receivingPracticeAsid);

    const hl7Ehr = coreEhr.payload;
    if (!hl7Ehr) {
      throw new Error('Could not extract payload from the JSON message stored in EHR Repo');
    }

    const updatedEhrCorePayload = await updateExtractForSending(
      hl7Ehr,
      ehrRequestId,
      receivingPracticeAsid,
      repositoryOdsCode
    );

    await sendMessage({
      interactionId,
      conversationId,
      odsCode,
      message: updatedEhrCorePayload,
      attachments: coreEhr.attachments,
      external_attachments: coreEhr.external_attachments
    });

    res.sendStatus(204);
  } catch (err) {
    logError('Sending EHR Extract failed', { error: err.message });
    res.status(503).send({ errors: ['Sending EHR Extract failed', err.message] });
  }
};
