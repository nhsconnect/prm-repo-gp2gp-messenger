import moment from 'moment';
import uuid from 'uuid/v4';
import * as mhsGatewayFake from './mhs-gateway-fake';
import * as mhsGateway from './mhs-gateway';
import { generateEhrRequestQuery } from '../templates/ehr-request-template';
import config from '../config';
import logger from '../config/logging';

const sendEhrRequest = (nhsNumber, odsCode) => {
  logger.info(`Requesting EHR of patient with NHS number ${nhsNumber} and ODS code ${odsCode}`);

  const mhs = config.isPTL ? mhsGateway : mhsGatewayFake;

  return mhs
    .getRoutingInformation(odsCode)
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
      return mhs.sendMessage(ehrRequestQuery);
    })
    .then(() =>
      logger.info(
        `Successfully requested EHR of patient with NHS number ${nhsNumber} and ODS code ${odsCode}`
      )
    );
};

export default sendEhrRequest;
