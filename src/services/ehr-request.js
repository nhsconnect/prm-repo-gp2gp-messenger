import moment from 'moment';
import uuid from 'uuid/v4';
import { getRoutingInformation, sendMessage } from '../fake-mhs';
import { generateEhrRequestQuery } from '../templates/ehr-request-template';
import config from '../config';
import logger from '../config/logging';

const sendEhrRequest = (nhsNumber, odsCode) => {
  logger.info(`Requesting EHR of patient with NHS number ${nhsNumber} and ODS code ${odsCode}`);

  return getRoutingInformation(odsCode)
    .then(({ asid }) => {
      const timestamp = moment().format('YYYYMMDDHHmmss');
      const ehrRequestQuery = generateEhrRequestQuery(
        uuid(),
        timestamp,
        asid,
        config.deductionsAsid,
        odsCode,
        config.deductionsOdsCode,
        nhsNumber
      );
      return sendMessage(ehrRequestQuery);
    })
    .then(() =>
      logger.info(
        `Successfully requested EHR of patient with NHS number ${nhsNumber} and ODS code ${odsCode}`
      )
    );
};

export default sendEhrRequest;
