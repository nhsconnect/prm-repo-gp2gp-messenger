import { validatePdsResponse } from '../pds-response-validator';
import { pdsQeuryFailedAE } from '../pds-responses/pds-response-nack-AE';

describe('pds-response-handler', () => {
  describe('parsePdsResponse', () => {
    it('should return false if the response is NACK', () => {
      return expect(validatePdsResponse(pdsQeuryFailedAE())).resolves.toBe(false);
    });
  });
});
