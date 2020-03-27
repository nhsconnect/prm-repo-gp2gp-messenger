import { when } from 'jest-when';
import config from '../../../config';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';
import * as mhsQueueTestHelper from '../../../services/mhs/mhs-old-queue-test-helper';
import generateEhrRequestQuery from '../../../templates/ehr-request-template';
import testData from '../../../templates/__tests__/testData.json';
import { MOCKED_UUID } from '../../../__mocks__/uuid';
import sendEhrRequest from '../send-ehr-request';

jest.mock('../../../services/mhs/mhs-old-queue-test-helper');

jest.mock('../../../middleware/logging');

describe('sendEhrRequest', () => {
  let ehrRequestQuery;

  beforeEach(() => {
    config.deductionsAsid = 'some-asid';
    config.deductionsOdsCode = 'some-ods-code';

    ehrRequestQuery = generateEhrRequestQuery({
      id: MOCKED_UUID,
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

  it('should send generated EHR request message to fake MHS when environment is not PTL', async done => {
    config.isPTL = false;

    when(mhsQueueTestHelper.getRoutingInformation)
      .calledWith(odsCode)
      .mockResolvedValue({ asid: receivingAsid });
    when(mhsQueueTestHelper.sendMessage)
      .calledWith(ehrRequestQuery)
      .mockResolvedValue();

    await sendEhrRequest(nhsNumber, odsCode);
    expect(mhsQueueTestHelper.sendMessage).toHaveBeenCalledWith(ehrRequestQuery);
    done();
  });

  it('should update log event for each stage', async done => {
    mhsQueueTestHelper.getRoutingInformation.mockResolvedValue({ asid: receivingAsid });

    await sendEhrRequest(nhsNumber, odsCode);
    expect(updateLogEvent).toHaveBeenCalledWith({
      status: 'fetching-routing-info',
      ehrRequest: { nhsNumber, odsCode }
    });
    expect(updateLogEvent).toHaveBeenCalledWith({
      status: 'requesting-ehr',
      ehrRequest: { asid: receivingAsid }
    });
    expect(updateLogEvent).toHaveBeenCalledWith({ status: 'requested-ehr' });

    done();
  });

  it('should call updateLogEventWithError with error', async done => {
    mhsQueueTestHelper.sendMessage.mockRejectedValue(Error('Something went wrong'));

    await sendEhrRequest(nhsNumber, odsCode).catch(() => {});
    expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
    expect(updateLogEventWithError).toHaveBeenCalledWith(Error('Something went wrong'));
    done();
  });
});
