import { parsePdsResponse } from '../pds-response-handler';
import { pdsResponseAck } from '../pds-responses/pds-response-ack';

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
  });
});
