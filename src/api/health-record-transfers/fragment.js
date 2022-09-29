import { retrieveMessageFromRepo } from '../../services/ehr/retrieve-message-from-repo';
import { getPracticeAsid } from '../../services/fhir/sds-fhir-client';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import { updateFragmentForSending } from '../../services/parser/message/update-fragment-for-sending';

export const healthRecordTransfersFragment = async (req, res) => {
  const COPC_INTERACTION_ID = 'COPC_IN000001UK01';
  const serviceId = `urn:nhs:names:services:gp2gp:${COPC_INTERACTION_ID}`;
  const { data } = req.body;
  const {
    outboundMessageId: messageId,
    outboundConversationId: conversationId,
    attributes: { recipientOdsCode },
    links: { originalMessageUrl }
  } = data;

  const mhsJsonFragment = await retrieveMessageFromRepo(originalMessageUrl);
  const recipientAsid = await getPracticeAsid(recipientOdsCode, serviceId);
  console.log('just for lint: ' + mhsJsonFragment + recipientAsid);
  await sendMessage({
    interactionId: COPC_INTERACTION_ID,
    conversationId,
    odsCode: recipientOdsCode,
    message: updateFragmentForSending(
      mhsJsonFragment.payload,
      messageId,
      recipientAsid,
      recipientOdsCode
    ),
    attachments: [],
    external_attachments: []
  });

  res.sendStatus(204);
};
