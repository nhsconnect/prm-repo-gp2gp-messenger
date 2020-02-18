import moment from 'moment';
import uuid from 'uuid/v4';
import config from '../config';
import { updateLogEvent, updateLogEventWithError } from '../middleware/logging';
import generateEhrRequestQuery from '../templates/ehr-request-template';
import * as mhsGateway from './mhs-gateway';
import * as mhsGatewayFake from './mhs-gateway-fake';

const sendEhrRequest = (nhsNumber, odsCode) => {
  const mhs = config.isPTL ? mhsGateway : mhsGatewayFake;

  updateLogEvent({
    status: 'fetching-routing-info',
    ehrRequest: { nhsNumber, odsCode, isPtl: config.isPTL }
  });

  return mhs
    .getRoutingInformation(odsCode)
    .then(({ asid }) => {
      updateLogEvent({ status: 'requesting-ehr', ehrRequest: { asid } });

      const timestamp = moment().format('YYYYMMDDHHmmss');
      const ehrRequestQuery = generateEhrRequestQuery({
        id: uuid(),
        timestamp: timestamp,
        receivingService: {
          asid,
          odsCode
        },
        sendingService: {
          asid: config.deductionsAsid,
          odsCode: config.deductionsOdsCode
        },
        patient: {
          nhsNumber: nhsNumber
        }
      });
      return mhs.sendMessage(ehrRequestQuery).catch(err => {
        updateLogEventWithError(err);
        return Promise.reject(err);
      });
    })
    .then(() => updateLogEvent({ status: 'requested-ehr' }));
};

export default sendEhrRequest;
