import dateFormat from 'dateformat';
import { param } from 'express-validator';
import { v4 as uuid } from 'uuid';
import { initializeConfig } from '../../config';
import { logEvent, logError } from '../../middleware/logging';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import { PDSRetrievalQueryResponse } from '../../services/pds';
import generatePdsRetrievalQuery from '../../templates/generate-pds-retrieval-request';

export const pdsRetrievalValidation = [
  param('nhsNumber').isNumeric().withMessage("'nhsNumber' provided is not numeric"),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters")
];

export const pdsRetrieval = async (req, res, next) => {
  const interactionId = 'QUPA_IN000008UK02';
  const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
  const conversationId = uuid().toUpperCase();
  const responseBody = { conversationId, data: {}, errors: [] };
  const config = initializeConfig();

  try {
    const message = await generatePdsRetrievalQuery({
      id: conversationId,
      timestamp,
      receivingService: { asid: config.pdsAsid },
      sendingService: { asid: config.deductionsAsid },
      patient: { nhsNumber: req.params.nhsNumber }
    });

    if (!message.includes(interactionId)) {
      throw new Error('interactionId is not included in the message');
    }

    const messageResponse = await sendMessage({ interactionId, conversationId, message });

    switch (messageResponse.status) {
      case 200:
        logEvent('200 PDS response received', {
          conversationId,
          response: messageResponse
        });

        responseBody.data = await new PDSRetrievalQueryResponse().handleMessage(
          messageResponse.data
        );
        res.status(200).json(responseBody);
        break;
      case 500:
        throw new Error(`MHS Error: ${messageResponse.data}`);
      default:
        throw new Error(`Unexpected Error: ${messageResponse.data}`);
    }

    next();
  } catch (err) {
    responseBody.errors.push(err.message);
    logError('PDS retrieval error', err);
    res.status(503).json(responseBody);
  }
};
