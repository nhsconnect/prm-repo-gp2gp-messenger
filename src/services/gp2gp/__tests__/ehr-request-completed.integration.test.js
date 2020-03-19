import { EHRRequestCompleted } from '../';
import { exampleEHRRequestCompleted } from './data/ehr-request-completed';

describe('EHRRequestCompleted', () => {
  describe('handleMesage', () => {
    it('should return object containing NHS Number', () => {
      return expect(
        new EHRRequestCompleted().handleMessage(exampleEHRRequestCompleted)
      ).resolves.toEqual(
        expect.objectContaining({
          nhsNumber: '9446363101'
        })
      );
    });

    it('should return object with nhsNumber as undefined if NHS Number can not be extractedr--', () => {
      const message = '<RCMR_IN030000UK06 xmlns="urn:hl7-org:v3"/>';
      return expect(new EHRRequestCompleted().handleMessage(message)).resolves.toEqual(
        expect.objectContaining({
          nhsNumber: undefined
        })
      );
    });
  });
});
