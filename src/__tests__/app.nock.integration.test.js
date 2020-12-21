import { v4 as uuid } from 'uuid';
import nock from 'nock';
import request from 'supertest';
import app from '../app';
//TODO - extract it somewhere else
import { templateEhrExtract } from '../services/parser/message/__tests__/update-extract-for-sending.test';

const authKey = 'correct-key';
describe('POST /health-record-transfers', () => {
  const host = 'http://localhost';
  const ehrPath = '/conversationId/messageId';
  const currentEhrUrl = `${host}${ehrPath}`;
  const conversationId = '41291044-8259-4D83-AE2B-93B7BFCABE73';
  const odsCode = 'B1234';
  const priorEhrRequestId = uuid();
  const ehrRequestId = '26A541CE-A5AB-4713-99A4-150EC3DA25C6';
  const mockBody = {
    data: {
      type: 'health-record-transfers',
      id: conversationId,
      attributes: {
        odsCode: odsCode,
        ehrRequestId: ehrRequestId
      },
      links: {
        currentEhrUrl: currentEhrUrl
      }
    }
  };
  beforeEach(() => {
    process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS = authKey;
    process.env.GP2GP_ADAPTOR_MHS_OUTBOUND_URL = 'http://localhost/mhs-outbound';
  });

  const ehrExtractStoredInS3 = ehrExtract => `----=_MIME-Boundary
<SOAP:Header/>

----=_MIME-Boundary

${ehrExtract}
  `;
  const matchPayload = ehrRequestId => {
    return body => {
      return body.payload.includes('<RCMR_IN030000UK06') && body.payload.includes(ehrRequestId);
    };
  };
  it('should send correctly updated ehr to mhs outbound', done => {
    const ehrExtract = templateEhrExtract(priorEhrRequestId);
    const mhsOutboundHeaders = {
      'Content-Type': 'application/json',
      'Interaction-ID': 'RCMR_IN030000UK06',
      'Sync-Async': false,
      'Correlation-Id': conversationId,
      'Ods-Code': odsCode,
      'from-asid': '200000001161'
    };

    const ehrRepoScope = nock(host).get(ehrPath).reply(200, ehrExtractStoredInS3(ehrExtract));
    const mhsOutboundScope = nock(host, { reqheaders: mhsOutboundHeaders })
      .post('/mhs-outbound', matchPayload(ehrRequestId))
      .reply(202);

    request(app)
      .post('/health-record-transfers')
      .set('Authorization', authKey)
      .send(mockBody)
      .expect(204)
      .expect(() => {
        expect(ehrRepoScope.isDone()).toBe(true);
        expect(mhsOutboundScope.isDone()).toBe(true);
      })
      .end(done);
  });
});
