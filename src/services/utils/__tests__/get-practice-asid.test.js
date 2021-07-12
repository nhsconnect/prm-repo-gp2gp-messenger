import { initializeConfig } from '../../../config';
import { getPracticeAsid } from '../get-practice-asid';
import { getPracticeAsidViaMhs } from '../../mhs/mhs-route-client';
import { getPracticeAsidViaFhir } from '../../fhir/sds-fhir-client';

jest.mock('../../../config');
jest.mock('../../mhs/mhs-route-client');
jest.mock('../../fhir/sds-fhir-client');

describe('getPracticeAsid', () => {
  it('should call getPracticeAsidViaMhs when feature toggle is off', async () => {
    initializeConfig.mockReturnValue({ toggleUseSdsFhir: false });

    await getPracticeAsid('ods', 'serviceId');

    expect(getPracticeAsidViaMhs).toHaveBeenCalledWith('ods', 'serviceId');
    expect(getPracticeAsidViaFhir).not.toHaveBeenCalled();
  });
});
