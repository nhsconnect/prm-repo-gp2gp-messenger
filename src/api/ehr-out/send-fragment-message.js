import { body } from 'express-validator';
import { setCurrentSpanAttributes } from '../../config/tracing';

export const sendFragmentMessageValidation = [
  body('conversationId').isUUID().withMessage("'conversationId' provided is not of type UUID"),
  body('odsCode').notEmpty().withMessage('Value has not been provided'),
  body('messageId').isUUID().withMessage('Provided value is not of type UUID'),
  body('fragmentMessage').notEmpty().withMessage('Value has not been provided')
];

export const sendFragmentMessage = async (req, res) => {
  // const COPC_INTERACTION_ID = 'COPC_IN000001UK01';
  // const serviceId = `urn:nhs:names:services:gp2gp:${COPC_INTERACTION_ID}`;
  const { conversationId } = req.body;
  setCurrentSpanAttributes(conversationId);
  res.sendStatus(204);
};
