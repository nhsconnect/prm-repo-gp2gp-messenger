import express from 'express';
import { param } from 'express-validator';
import dateFormat from 'dateformat';
import uuid from 'uuid/v4';
import config from '../config';
import generateUpdateOdsRequest from '../templates/generate-update-ods-request';
import { checkIsAuthenticated } from '../middleware/auth';
import { updateLogEvent, updateLogEventWithError } from '../middleware/logging';
import { validate } from '../middleware/validation';
import { sendMessage } from '../services/mhs/mhs-outbound-client';

const router = express.Router();

const validationRules = [
    param('nhsNumber')
        .isNumeric()
        .withMessage("'nhsNumber' provided is not numeric"),
    param('nhsNumber')
        .isLength({ min: 10, max: 10 })
        .withMessage("'nhsNumber' provided is not 10 characters")
];

router.post(
    '/:serialChangeNumber/:pdsId/:nhsNumber',
    checkIsAuthenticated,
    validationRules,
    validate,
    async (req, res, next) => {
        try {
            const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
            const interactionId = 'PRPA_IN000203UK03';
            const conversationId = uuid().toUpperCase();

            const message = await generateUpdateOdsRequest({
                id: conversationId,
                timestamp,
                receivingService: { asid: config.pdsAsid },
                sendingService: { asid: config.deductionsAsid, odsCode: config.deductionsOdsCode },
                patient: {
                    nhsNumber: req.params.nhsNumber,
                    pdsId: req.params.pdsId,
                    pdsUpdateChangeNumber: req.params.serialChangeNumber
                }
            });

            const messageResponse = await sendMessage({ interactionId, conversationId, message });

            switch (messageResponse.status) {
                case 200:
                    updateLogEvent({
                        status: '200 PDS Update response received',
                        conversationId,
                        response: messageResponse
                    });
                    res.status(200).json(messageResponse.data);
                    break;
                case 500:
                    throw new Error(`MHS Error: ${messageResponse.data}`);
                default:
                    if (`${messageResponse}`) {
                        throw new Error(`Unexpected Error: ${messageResponse.data}`);
                    }
                    throw new Error(`No message response from mhs`);
            }
            next();
        } catch (err) {
            updateLogEventWithError(err);
            res.status(503).json({
                errors: err.message
            });
        }
    }
);

export default router;
