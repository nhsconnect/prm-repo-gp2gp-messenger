import { body } from 'express-validator';
import { retrieveEhrFromRepo } from '../../services/ehr/retrieve-ehr-from-repo';
import { parseMultipartBody } from '../../services/parser';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import { updateExtractForSending } from '../../services/parser/message/update-extract-for-sending';
import { getPracticeAsid } from '../../services/mhs/mhs-route-client';
import { logError, logInfo } from '../../middleware/logging';

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

  try {
    const ehrExtract = await retrieveEhrFromRepo(currentEhrUrl);
    const practiceAsid = await getPracticeAsid(odsCode, serviceId);
    const multipartMessage = parseMultipartBody(ehrExtract);
    if (multipartMessage.length < 2 || multipartMessage[1].body === undefined) {
      throw new Error('Could not extract HLv7 message from the GP2GP message stored in EHR Repo');
    }
    const ehrMessage = multipartMessage[1].body;
    const ehrMessageWithEhrRequestId = await updateExtractForSending(
      ehrMessage,
      ehrRequestId,
      practiceAsid
    );
    await sendMessage({
      interactionId,
      conversationId,
      odsCode,
      message: ehrMessageWithEhrRequestId
    });

    logInfo('Successfully sent EHR', { conversationId });
    res.sendStatus(204);
  } catch (err) {
    logError('Sending EHR Extract failed', { error: err.message });
    res.status(503).send({ errors: ['Sending EHR Extract failed', err.message] });
  }
};
