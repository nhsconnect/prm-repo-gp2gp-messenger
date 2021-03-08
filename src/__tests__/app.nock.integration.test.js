import { v4 as uuid } from 'uuid';
import nock from 'nock';
import request from 'supertest';
import app from '../app';
//TODO - extract it somewhere else
import { templateEhrExtract } from '../services/parser/message/__tests__/update-extract-for-sending.test';
import { pdsRetrivealQueryResponseSuccess } from '../services/pds/__tests__/data/pds-retrieval-query-response-success';

const authKey = 'correct-key';
const host = 'http://localhost';
const odsCode = 'B1234';

beforeAll(() => {
  process.env.GP2GP_ADAPTOR_AUTHORIZATION_KEYS = authKey;
  process.env.GP2GP_ADAPTOR_MHS_OUTBOUND_URL = 'http://localhost/mhs-outbound';
  process.env.GP2GP_ADAPTOR_MHS_ROUTE_URL = 'http://localhost/mhs-route';
});

describe('POST /health-record-transfers', () => {
  const ehrPath = '/conversationId/messageId';
  const currentEhrUrl = `${host}${ehrPath}`;
  const conversationId = '41291044-8259-4d83-ae2b-93b7bfcabe73';
  const priorEhrRequestId = uuid();
  const expectedReceivingAsid = '200000000678';
  const ehrRequestId = '26a541ce-a5ab-4713-99a4-150ec3da25c6';
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

  const ehrExtractStoredInS3 = ehrExtract => `----=_MIME-Boundary
<SOAP:Header/>

----=_MIME-Boundary

${ehrExtract}
  `;
  const matchPayload = ehrRequestId => {
    return body => {
      return (
        body.payload.includes('<RCMR_IN030000UK06') &&
        body.payload.includes(ehrRequestId) &&
        body.payload.includes(expectedReceivingAsid)
      );
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

    const mhsRouteScope = nock(`${host}/mhs-route`)
      .get(`/routing?org-code=${odsCode}&service-id=urn:nhs:names:services:gp2gp:RCMR_IN030000UK06`)
      .reply(200, { uniqueIdentifier: [expectedReceivingAsid] });
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
        expect(mhsRouteScope.isDone()).toBe(true);
      })
      .end(done);
  });
});

describe('GET /patient-demographics', () => {
  it('should return a 200 status code for /patient-demographics/:nhsNumber', done => {
    const mhsOutboundHeaders = {
      'Content-Type': 'application/json',
      'Interaction-ID': 'QUPA_IN000008UK02',
      'Sync-Async': false,
      'Ods-Code': 'YES',
      'from-asid': '200000001161'
    };

    const mhsOutboundScope = nock(host, { reqheaders: mhsOutboundHeaders })
      .post('/mhs-outbound')
      .reply(200, pdsRetrivealQueryResponseSuccess);

    request(app)
      .get('/patient-demographics/9999999999')
      .set('Authorization', authKey)
      .expect(200)
      .expect(res => {
        expect(mhsOutboundScope.isDone()).toBe(true);
        expect(res.body).toEqual(
          expect.objectContaining({
            data: {
              odsCode: 'B86041',
              patientPdsId: 'cppz',
              serialChangeNumber: '138'
            }
          })
        );
      })
      .end(done);
  });
});

describe('POST /health-record-requests/:nhsNumber/acknowledgement', () => {
  const practiceAsid = '200007389';
  const conversationId = uuid();
  const mockBody = {
    conversationId,
    messageId: uuid(),
    odsCode: odsCode,
    repositoryAsid: '20000018274'
  };

  it('should successfully send acknowledgement and return 204', done => {
    const mhsOutboundHeaders = {
      'Content-Type': 'application/json',
      'Interaction-ID': 'MCCI_IN010000UK13',
      'Correlation-ID': conversationId,
      'Sync-Async': false,
      'Ods-Code': odsCode,
      'from-asid': '200000001161'
    };

    const mhsRouteScope = nock(`${host}/mhs-route`)
      .get(`/routing?org-code=${odsCode}&service-id=urn:nhs:names:services:gp2gp:MCCI_IN010000UK13`)
      .reply(200, { uniqueIdentifier: [practiceAsid] });

    const mhsOutboundScope = nock(host, mhsOutboundHeaders).post('/mhs-outbound').reply(204);

    request(app)
      .post('/health-record-requests/9999999999/acknowledgement')
      .set('Authorization', authKey)
      .send(mockBody)
      .expect(204)
      .expect(() => {
        expect(mhsRouteScope.isDone()).toBe(true);
        expect(mhsOutboundScope.isDone()).toBe(true);
      })
      .end(done);
  });
});

describe('POST /health-record-requests/send-continue-message', () => {
  const practiceAsid = '200007389';
  const interactionId = 'COPC_IN000001UK01';
  const conversationId = uuid();
  const odsCode = 'B12345';
  const ehrExtractMessageId = uuid();
  const body = {
    conversationId,
    odsCode,
    ehrExtractMessageId
  };

  it('should successfully send continue message and return 204', async () => {
    const mhsOutboundHeaders = {
      'Content-Type': 'application/json',
      'Interaction-ID': interactionId,
      'Correlation-ID': conversationId,
      'Sync-Async': false,
      'Ods-Code': odsCode,
      'from-asid': '200000001161'
    };

    const mhsRouteScope = nock(`${host}/mhs-route`)
      .get(`/routing?org-code=${odsCode}&service-id=urn:nhs:names:services:gp2gp:${interactionId}`)
      .reply(200, { uniqueIdentifier: [practiceAsid] });

    const mhsOutboundScope = nock(host, mhsOutboundHeaders).post('/mhs-outbound').reply(204);

    const res = await request(app)
      .post('/health-record-requests/send-continue-message')
      .set('Authorization', authKey)
      .send(body);

    expect(res.status).toEqual(204);
    expect(mhsRouteScope.isDone()).toBe(true);
    expect(mhsOutboundScope.isDone()).toBe(true);
  });
});
