import { downloadFromUrl } from '../../services/ehr/download-from-url';
import { getPracticeAsid } from '../../services/fhir/sds-fhir-client';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import { updateFragmentForSending } from '../../services/parser/message/update-fragment-for-sending';
import { setCurrentSpanAttributes } from '../../config/tracing';
import { wrangleAttachments } from '../../services/mhs/mhs-attachments-wrangler';
import { logError } from '../../middleware/logging';

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

  setCurrentSpanAttributes({ conversationId });

  try {
    const mhsJsonFragment = await downloadFromUrl(originalMessageUrl, 'EHR fragment from repo');
    const recipientAsid = await getPracticeAsid(recipientOdsCode, serviceId);

    const updatedFragmentPayload = await updateFragmentForSending(
      mhsJsonFragment.payload,
      messageId,
      recipientAsid,
      recipientOdsCode
    );

    const attachmentsInfo = await wrangleAttachments(mhsJsonFragment);

    await sendMessage({
      interactionId: COPC_INTERACTION_ID,
      conversationId,
      odsCode: recipientOdsCode,
      message: updatedFragmentPayload,
      ...attachmentsInfo
    });

    res.sendStatus(204);
  } catch (err) {
    logError('Sending EHR fragment failed', { error: err.message });
    res.status(503).send({ errors: ['Sending EHR fragment failed', err.message] });
  }
};
