import sendEhrRequest from './ehr-request';
import * as mhsGatewayFake from './mhs-gateway-fake';
import * as mhsGateway from './mhs-gateway';
import { generateEhrRequestQuery } from '../templates/ehr-request-template';
import { when } from 'jest-when';
import config from '../config';

jest.mock('./mhs-gateway-fake');
jest.mock('./mhs-gateway');
jest.mock('../config/logging');
jest.mock('uuid/v4', () => () => 'some-uuid');
jest.mock('moment', () => () => ({ format: () => '20190228112548' }));

describe('sendEhrRequest', () => {
  const odsCode = 'some-ods-code';
  const receivingAsid = 'some-asid';
  const nhsNumber = 'some-nhs-number';

  it('should send generated EHR request message to real MHS when environment is PTL', () => {
    config.isPTL = true;

    when(mhsGateway.getRoutingInformation)
      .calledWith(odsCode)
      .mockResolvedValue({ asid: receivingAsid });

    return sendEhrRequest(nhsNumber, odsCode).then(() => {
      const ehrRequestQuery = generateEhrRequestQuery(
        'some-uuid',
        '20190228112548',
        receivingAsid,
        config.deductionsAsid,
        odsCode,
        config.deductionsOdsCode,
        nhsNumber
      );
      expect(mhsGateway.sendMessage).toHaveBeenCalledWith(ehrRequestQuery);
    });
  });

  it('should send generated EHR request message to fake MHS when environment is not PTL', () => {
    config.isPTL = false;

    when(mhsGatewayFake.getRoutingInformation)
      .calledWith(odsCode)
      .mockResolvedValue({ asid: receivingAsid });

    return sendEhrRequest(nhsNumber, odsCode).then(() => {
      const ehrRequestQuery = generateEhrRequestQuery(
        'some-uuid',
        '20190228112548',
        receivingAsid,
        config.deductionsAsid,
        odsCode,
        config.deductionsOdsCode,
        nhsNumber
      );
      expect(mhsGatewayFake.sendMessage).toHaveBeenCalledWith(ehrRequestQuery);
    });
  });
});
