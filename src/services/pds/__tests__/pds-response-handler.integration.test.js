import { parsePdsResponse } from '../pds-response-handler';
import { pdsResponseAck } from '../pds-responses/pds-response-ack';
import { pdsQeuryFailedAE } from '../pds-responses/pds-response-nack-AE';

describe('pds-response-handler', () => {
  describe('parsePdsResponse', () => {
    it('should return an object with serialChangeNumber and patientPdsId if the response is ACK', () => {
      return parsePdsResponse(pdsResponseAck()).then(parsedMessage => {
        expect(parsedMessage).toEqual({
          serialChangeNumber: '138',
          patientPdsId: 'cppz'
        });
      });
    });

    it('should return empty object and log the error if the response is NACK', () => {
      return parsePdsResponse(pdsQeuryFailedAE()).then(parsedMessage => {
        expect(parsedMessage).toEqual({});
      });
    });
  });
});
