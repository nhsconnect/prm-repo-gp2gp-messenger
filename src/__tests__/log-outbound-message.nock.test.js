import path from 'path';
import { readFileSync } from 'fs';

import request from 'supertest';
import nock from 'nock';

import app from '../app';
import { logInfo } from '../middleware/logging';
import { removeBase64Payloads } from "../services/mhs/logging-utils";

jest.mock('../middleware/logging');
jest.mock('../services/sqs/sqs-client');

const MOCK_MHS_OUTBOUND_URL = 'http://localhost/mhs-outbound';
const MOCK_SDS_FHIR_URL = 'http://localhost/sds-fhir';
const FAKE_REPO_ASID_CODE = 'fake_repo_asid_code';
const FAKE_DEST_ASID_CODE = 'fake_dest_asid_code';
const FAKE_REPO_ODS_CODE = 'B85002';
const FAKE_DEST_ODS_CODE = 'M85019';

const loadTestMessageFragment = messageId => {
  const jsonString = readFileSync(
    path.join(__dirname, 'data', 'TestEhrFragment'),
    'utf8'
  ).replaceAll('__MESSAGE_ID__', messageId);
  return JSON.parse(jsonString);
};

const loadExpectedOutboundMessageFragmentBody = messageId => {
  const jsonString = readFileSync(
    path.join(__dirname, 'data', 'ExpectedOutboundFragmentBody'),
    'utf8'
  )
    .replaceAll('__MESSAGE_ID__', messageId)
    .replaceAll('__REPO_ASID_CODE__', FAKE_REPO_ASID_CODE)
    .replaceAll('__REPO_ODS_CODE__', FAKE_REPO_ODS_CODE)
    .replaceAll('__DEST_ASID_CODE__', FAKE_DEST_ASID_CODE)
    .replaceAll('__DEST_ODS_CODE__', FAKE_DEST_ODS_CODE);
  return JSON.parse(jsonString);
};

const isSmallerThan256KB = jsObject => {
  return JSON.stringify(jsObject).length < 256 * 1024;
};

const createMockFhirScope = () => {
  const mockFhirResponse = {
    entry: [
      {
        resource: {
          identifier: [
            {
              system: 'https://fhir.nhs.uk/Id/nhsSpineASID',
              value: FAKE_DEST_ASID_CODE
            }
          ]
        }
      }
    ]
  };

  return nock(MOCK_SDS_FHIR_URL, {
    reqheaders: {
      apiKey: 'fake-sds-api-key'
    }
  })
    .get(`/Device`)
    .query(() => true)
    .reply(200, mockFhirResponse);
};

const createMockMHSScope = () => {
  const postRequestBody = {};

  const scope = nock(MOCK_MHS_OUTBOUND_URL)
    .post('')
    .reply((_, requestBody) => {
      Object.assign(postRequestBody, requestBody);
      return [200, 'OK'];
    });

  scope.postRequestBody = postRequestBody;
  return scope;
};

describe('logOutboundMessage', () => {
  const { v4: uuid } = jest.requireActual('uuid');
  const conversationId = uuid().toUpperCase();
  const messageId = uuid().toUpperCase();
  const odsCode = FAKE_DEST_ODS_CODE;
  const authKey = 'fake-auth-key';

  beforeEach(() => {
    process.env.API_KEY_FOR_TEST_USER = authKey;
    process.env.GP2GP_MESSENGER_MHS_OUTBOUND_URL = MOCK_MHS_OUTBOUND_URL;
    process.env.SDS_FHIR_URL = MOCK_SDS_FHIR_URL;
    process.env.SDS_FHIR_API_KEY = 'fake-sds-api-key';
    process.env.SPINE_ORG_CODE = 'YES';
    process.env.GP2GP_MESSENGER_REPOSITORY_ASID = FAKE_REPO_ASID_CODE;
    process.env.GP2GP_MESSENGER_REPOSITORY_ODS_CODE = FAKE_REPO_ODS_CODE;
  });

  describe('case of sending a EHR fragment', () => {
    it('should log the outbound COPC fragment message with all base64 contents removed', async () => {
      // given
      const fragmentMessage = loadTestMessageFragment(messageId);
      const expectedOutboundFragmentBody = loadExpectedOutboundMessageFragmentBody(messageId);

      const mockRequestBody = {
        conversationId,
        odsCode,
        fragmentMessage,
        messageId
      };

      // when
      const sdsFhirScope = createMockFhirScope();
      const mhsScope = createMockMHSScope();

      const response = await request(app)
        .post('/ehr-out-transfers/fragment')
        .set('Authorization', authKey)
        .send(mockRequestBody);

      // then
      expect(logInfo).toBeCalled();
      expect(sdsFhirScope.isDone()).toBe(true);
      expect(mhsScope.isDone()).toBe(true);
      expect(response.statusCode).toBe(204);

      // extract the log with outbound COPC message from all arguments that logInfo was called with.
      const outboundMessageInLog = logInfo.mock.calls
        .map(args => args[0])
        .filter(
          loggedObject =>
            loggedObject?.body?.payload &&
            loggedObject?.body?.payload.startsWith('<COPC_IN000001UK01')
        )
        .pop();

      // verify that the log does exist and is under 256KB
      expect(outboundMessageInLog).not.toEqual(undefined);
      expect(isSmallerThan256KB(outboundMessageInLog)).toBe(true);

      // compare the logged content with what we expected
      expect(outboundMessageInLog.body).toEqual(expectedOutboundFragmentBody);
      expect(outboundMessageInLog.headers).toMatchObject({
        'correlation-id': conversationId,
        'interaction-id': 'COPC_IN000001UK01',
        'message-id': messageId,
        'ods-code': FAKE_DEST_ODS_CODE,
        'from-asid': FAKE_REPO_ASID_CODE,
      });

      // verify the logged content match with what comes out from gp2gp messenger
      expect(outboundMessageInLog.body.payload).toEqual(mhsScope.postRequestBody.payload);
      expect(outboundMessageInLog.body.external_attachments).toEqual(
        mhsScope.postRequestBody.external_attachments
      );

      // The attachment are not exactly equal, as the one in logs got base64 contents removed.
      // Other than that, the logged attachments should be same as the actual attachments in outbound post request
      expect(outboundMessageInLog.body.attachments).not.toEqual(mhsScope.postRequestBody.attachments)
      expect(outboundMessageInLog.body.attachments).toEqual(removeBase64Payloads(mhsScope.postRequestBody.attachments));
    });

    it('should keep the base64 content in the actual outbound post request unchanged', async () => {
      // given
      const fragmentMessage = loadTestMessageFragment(messageId);

      const mockRequestBody = {
        conversationId,
        odsCode,
        fragmentMessage,
        messageId
      };

      // when
      createMockFhirScope();
      const mhsScope = createMockMHSScope();

      await request(app)
        .post('/ehr-out-transfers/fragment')
        .set('Authorization', authKey)
        .send(mockRequestBody);

      // then
      // verify that the base64 payload in the outbound post request body is still intact
      expect(isSmallerThan256KB(mhsScope.postRequestBody)).toBe(false);
      expect(mhsScope.postRequestBody.attachments[0].payload).toEqual(fragmentMessage.attachments[0].payload);
    });
  });

  describe('case of sending a EHR core', () => {});
});
