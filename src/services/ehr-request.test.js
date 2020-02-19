import { when } from 'jest-when';
import config from '../config';
import { updateLogEvent } from '../middleware/logging';
import generateEhrRequestQuery from '../templates/ehr-request-template';
import testData from '../templates/tests/testData.json';
import sendEhrRequest from './ehr-request';
import * as mhsGateway from './mhs-gateway';
import * as mhsGatewayFake from './mhs-gateway-fake';

jest.mock('./mhs-gateway-fake');
jest.mock('./mhs-gateway');
jest.mock('../middleware/logging');
jest.mock('uuid/v4', () => () => 'some-uuid');
jest.mock('moment', () => () => ({ format: () => '20190228112548' }));

describe('sendEhrRequest', () => {
  let ehrRequestQuery;
  beforeEach(() => {
    config.deductionsAsid = 'some-asid';
    config.odsCode = 'some-ods-code';

    ehrRequestQuery = generateEhrRequestQuery({
      id: 'some-uuid',
      timestamp: '20190228112548',
      receivingService: {
        asid: receivingAsid,
        odsCode: odsCode
      },
      sendingService: {
        asid: config.deductionsAsid,
        odsCode: config.deductionsOdsCode
      },
      patient: {
        nhsNumber: nhsNumber
      }
    });
  });

  afterEach(() => {
    config.deductionsAsid = process.env.DEDUCTIONS_ASID;
    config.deductionsOdsCode = process.env.DEDUCTIONS_ODS_CODE;
  });

  const odsCode = testData.emisPractise.odsCode;
  const receivingAsid = testData.emisPractise.asid;
  const nhsNumber = testData.emisPatient.nhsNumber;

  it('should send generated EHR request message to real MHS when environment is PTL', () => {
    config.isPTL = true;

    when(mhsGateway.getRoutingInformation)
      .calledWith(odsCode)
      .mockResolvedValue({ asid: receivingAsid });
    when(mhsGateway.sendMessage)
      .calledWith(ehrRequestQuery)
      .mockResolvedValue();
    return sendEhrRequest(nhsNumber, odsCode).then(() => {
      expect(mhsGateway.sendMessage).toHaveBeenCalledWith(ehrRequestQuery);
    });
  });

  it('should send generated EHR request message to fake MHS when environment is not PTL', () => {
    config.isPTL = false;

    when(mhsGatewayFake.getRoutingInformation)
      .calledWith(odsCode)
      .mockResolvedValue({ asid: receivingAsid });
    when(mhsGatewayFake.sendMessage)
      .calledWith(ehrRequestQuery)
      .mockResolvedValue();

    return sendEhrRequest(nhsNumber, odsCode).then(() => {
      expect(mhsGatewayFake.sendMessage).toHaveBeenCalledWith(ehrRequestQuery);
    });
  });

  it('should update log event for each stage', () => {
    mhsGatewayFake.getRoutingInformation.mockResolvedValue({ asid: receivingAsid });

    return sendEhrRequest(nhsNumber, odsCode).then(() => {
      expect(updateLogEvent).toHaveBeenCalledWith({
        status: 'fetching-routing-info',
        ehrRequest: { nhsNumber, odsCode, isPtl: false }
      });
      expect(updateLogEvent).toHaveBeenCalledWith({
        status: 'requesting-ehr',
        ehrRequest: { asid: receivingAsid }
      });
      expect(updateLogEvent).toHaveBeenCalledWith({ status: 'requested-ehr' });
    });
  });
});
