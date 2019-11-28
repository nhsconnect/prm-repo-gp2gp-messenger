import sendEhrRequest from './ehr-request';
import { getRoutingInformation, sendMessage } from '../fake-mhs';
import { generateEhrRequestQuery } from '../templates/ehr-request-template';
import { when } from 'jest-when';
import config from '../config';

jest.mock('../fake-mhs');
jest.mock('../config/logging');
jest.mock('uuid/v4', () => jest.fn().mockReturnValue('some-uuid'));
jest.mock('moment', () => jest.fn().mockReturnValue({ format: () => '20190228112548' }));

describe('sendEhrRequest', () => {
  it('should send generated ehr request message to MHS', () => {
    const odsCode = 'some-ods-code';
    const receivingAsid = 'some-asid';
    const nhsNumber = 'some-nhs-number';

    when(getRoutingInformation)
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
      expect(sendMessage).toHaveBeenCalledWith(ehrRequestQuery);
    });
  });
});
