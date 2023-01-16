import { setCurrentSpanAttributes } from '../../config/tracing';
import { getPracticeAsid } from '../../services/fhir/sds-fhir-client';
import { logInfo } from '../../middleware/logging';

export const ehrOutTransfers = async (req, res) => {
  const { conversationId, odsCode } = req.body;
  const interactionId = 'RCMR_IN030000UK06';
  const serviceId = `urn:nhs:names:services:gp2gp:${interactionId}`;
  setCurrentSpanAttributes({ conversationId });
  logInfo('Getting asid for practice');
  const asid = await getPracticeAsid(odsCode, serviceId); //need to rename the variable to receivingPracticeAcid
  logInfo('Got asid for practice and its ' + asid);
  res.sendStatus(204);
};
