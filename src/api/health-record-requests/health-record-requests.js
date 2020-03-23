import { param, body } from 'express-validator';

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
    res.sendStatus(200);
};
