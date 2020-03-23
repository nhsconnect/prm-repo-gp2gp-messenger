import { param } from 'express-validator';

export const healthRecordRequestValidation = [
    param('nhsNumber')
        .isNumeric()
        .withMessage(`'nhsNumber' provided is not numeric`),
    param('nhsNumber')
        .isLength({ min: 10, max: 10 })
        .withMessage("'nhsNumber' provided is not 10 digits"),
];


export const healthRecordRequests = (req, res) => {
    res.sendStatus(200);
};
