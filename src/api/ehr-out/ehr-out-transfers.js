import {setCurrentSpanAttributes} from '../../config/tracing';
import {getPracticeAsid} from '../../services/fhir/sds-fhir-client';
import {logError, logInfo} from '../../middleware/logging';

export const ehrOutTransfers = async (req, res) => {
    const {conversationId, odsCode, coreEhr} = req.body;
    const interactionId = 'RCMR_IN030000UK06';
    const serviceId = `urn:nhs:names:services:gp2gp:${interactionId}`;
    setCurrentSpanAttributes({conversationId});

    try {

        logInfo('Getting asid for practice');
        const asid = await getPracticeAsid(odsCode, serviceId); //need to rename the variable to receivingPracticeAcid
        logInfo('Got asid for practice and its ' + asid);

        const hl7Ehr = coreEhr.payload;
        if (!hl7Ehr) {
            throw new Error('Could not extract payload from the JSON message stored in EHR Repo');
        }

        res.sendStatus(204);
    } catch (err) {
        logError('Sending EHR Extract failed', {error: err.message});
        res.status(503).send({errors: ['Sending EHR Extract failed', err.message]});
    }
};
