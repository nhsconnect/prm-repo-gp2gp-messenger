import express from 'express';
import { authenticateRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { healthRecordTransfers, healthRecordTransferValidation } from './health-record-transfers';
import { retrieveMessageFromRepo } from '../../services/ehr/retrieve-message-from-repo';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import { getPracticeAsid } from '../../services/fhir/sds-fhir-client';

export const healthRecordTransferRouter = express.Router();

healthRecordTransferRouter.post(
  '/',
  authenticateRequest,
  healthRecordTransferValidation,
  validate,
  healthRecordTransfers
);

const healthRecordTransfersFragment = async (req, res) => {
  const COPC_INTERACTION_ID = 'COPC_IN000001UK01';
  const serviceId = `urn:nhs:names:services:gp2gp:${COPC_INTERACTION_ID}`;
  const { data } = req.body;
  const {
    outboundConversationId: conversationId,
    attributes: { recipientOdsCode },
    links: { originalMessageUrl }
  } = data;

  const mhsJsonFragment = await retrieveMessageFromRepo(originalMessageUrl);
  const practiceAsid = await getPracticeAsid(recipientOdsCode, serviceId);
  console.log('just for lint: ' + mhsJsonFragment + practiceAsid);
  await sendMessage({
    interactionId: COPC_INTERACTION_ID,
    conversationId,
    odsCode: recipientOdsCode,
    // WIP stubbed
    message: '<' + COPC_INTERACTION_ID + ' 26a541ce-a5ab-4713-99a4-150ec3da25c6' + '200000000678',
    attachments: [],
    external_attachments: []
  });

  res.sendStatus(204);
};

healthRecordTransferRouter.post(
  '/fragment',
  authenticateRequest,
  [
    // some validation
  ],
  validate,
  healthRecordTransfersFragment
);
