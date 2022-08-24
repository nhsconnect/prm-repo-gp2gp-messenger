import { body } from 'express-validator';
import { retrieveEhrFromRepo } from '../../services/ehr/retrieve-ehr-from-repo';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import { wrangleAttachments } from '../../services/mhs/mhs-attachments-wrangler';
import { updateExtractForSending } from '../../services/parser/message/update-extract-for-sending';
import { logError, logInfo } from '../../middleware/logging';
import { setCurrentSpanAttributes } from '../../config/tracing';
import { getPracticeAsid } from '../../services/fhir/sds-fhir-client';

export const healthRecordTransferValidation = [
  body('data.type')
    .equals('health-record-transfers')
    .withMessage("Provided value is not 'health-record-transfers'"),
  body('data.id').isUUID().withMessage("'conversationId' provided is not of type UUID"),
  body('data.attributes.odsCode').notEmpty().withMessage('Value has not been provided'),
  body('data.attributes.ehrRequestId').isUUID().withMessage('Provided value is not of type UUID'),
  body('data.links.currentEhrUrl').notEmpty().withMessage('Value has not been provided')
];

export const healthRecordTransfers = async (req, res) => {
  const { data } = req.body;
  const {
    id: conversationId,
    attributes: { odsCode, ehrRequestId },
    links: { currentEhrUrl }
  } = data;
  const interactionId = 'RCMR_IN030000UK06';
  const serviceId = `urn:nhs:names:services:gp2gp:${interactionId}`;
  setCurrentSpanAttributes({ conversationId });

  try {
    const mhsJsonEhrCoreMessage = await retrieveEhrFromRepo(currentEhrUrl);
    const practiceAsid = await getPracticeAsid(odsCode, serviceId);
    const hl7Ehr = mhsJsonEhrCoreMessage.payload;
    if (!hl7Ehr) {
      throw new Error('Could not extract payload from the JSON message stored in EHR Repo');
    }
    const ehrMessageWithEhrRequestId = await updateExtractForSending(
      hl7Ehr,
      ehrRequestId,
      practiceAsid
    );

    const attachmentsInfo = await wrangleAttachments(mhsJsonEhrCoreMessage);

    await sendMessage({
      interactionId,
      conversationId,
      odsCode,
      message: ehrMessageWithEhrRequestId,
      ...attachmentsInfo
    });

    logInfo('Successfully sent EHR', { conversationId });
    res.sendStatus(204);
  } catch (err) {
    logError('Sending EHR Extract failed', { error: err.message });
    res.status(503).send({ errors: ['Sending EHR Extract failed', err.message] });
  }
};
