import { pdsQeuryFailedAE } from '../pds-responses/pds-response-nack-AE';
import { validatePdsResponse } from '../pds-response-validator';

describe('pds-response-handler', () => {
  describe('parsePdsResponse', () => {
    it('should return false if the response is NACK', () => {
      return validatePdsResponse(pdsQeuryFailedAE()).catch(err => {
        expect(err.message).toEqual('failed to extract PDS serial change number');
      });
    });
  });
});
