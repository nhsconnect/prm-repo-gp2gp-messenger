import { body } from 'express-validator';

export const healthRecordTransferValidation = [
  body('data.type')
    .equals('health-record-transfers')
    .withMessage("Provided value is not 'health-record-transfers'"),
  body('data.id').isUUID().withMessage("'conversationId' provided is not of type UUID"),
  body('data.attributes.odsCode').notEmpty().withMessage('Value has not been provided'),
  body('data.attributes.ehrRequestId').isUUID().withMessage('Provided value is not of type UUID'),
  body('data.links.currentEhrUrl').notEmpty().withMessage('Value has not been provided')
];

export const healthRecordTransfers = (req, res) => {
  res.sendStatus(204);
};
