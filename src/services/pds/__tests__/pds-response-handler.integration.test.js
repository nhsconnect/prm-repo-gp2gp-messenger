import { handlePdsResponse } from '../pds-response-handler';
import { pdsRetrivealQueryResponseSuccess } from './data/pds-retrieval-query-response-success';

describe('pds-response-handler', () => {
  describe('handlePdsResponse', () => {
    it('should return an object with serialChangeNumber and patientPdsId if the response is ACK', () => {
      return handlePdsResponse(pdsRetrivealQueryResponseSuccess).then(parsedMessage => {
        expect(parsedMessage).toEqual({
          serialChangeNumber: '138',
          patientPdsId: 'cppz',
          odsCode: 'B86041'
        });
      });
    });
  });
});
