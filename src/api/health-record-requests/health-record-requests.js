import { param, body } from 'express-validator';
import { v4 as uuid } from 'uuid';
import dateFormat from 'dateformat';
import { generateEhrRequestQuery } from '../../templates/ehr-request-template';

export const healthRecordRequestValidation = [
    param('nhsNumber')
        .isNumeric()
        .withMessage(`'nhsNumber' provided is not numeric`),
    param('nhsNumber')
        .isLength({ min: 10, max: 10 })
        .withMessage("'nhsNumber' provided is not 10 digits"),
    body('repositoryOdsCode')
        .notEmpty()
        .withMessage("'repositoryOdsCode' is not configured"),
    body('repositoryAsid')
        .notEmpty()
        .withMessage("'repositoryAsid' is not configured"),
    body('practiceOdsCode')
        .notEmpty()
        .withMessage("'practiceOdsCode' is not configured"),
    body('practiceAsid')
        .notEmpty()
        .withMessage("'practiceAsid' is not configured")
];

export const healthRecordRequests = (req, res) => {
    const message = buildEhrRequest(req);
    res.sendStatus(200);
};

export const buildEhrRequest = async req => {
    const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
    const conversationId = uuid().toUpperCase();

    return generateEhrRequestQuery({
        id: conversationId,
        timestamp,
        receivingService: {
            asid: req.body.practiceAsid,
            odsCode: req.body.practiceOdsCode
        },
        sendingService: {
            asid: req.body.repositoryAsid,
            odsCode: req.body.repositoryOdsCode
        },
        patient: {
            nhsNumber: req.params.nhsNumber
        }
    });
}
