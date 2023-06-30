import path from 'path';
import { readFileSync } from 'fs';

import request from 'supertest';
import nock from 'nock';

import app from '../../../app';
import { logInfo } from '../../../middleware/logging';
import { removeBase64Payloads } from '../logging-utils';
import {
  buildPostRequestBody,
  createMockFhirScope,
  EhrMessageType,
  isSmallerThan256KB
} from './test_utils';

jest.mock('../../../middleware/logging');
jest.mock('../../../services/sqs/sqs-client');

const { v4 } = jest.requireActual('uuid');
const randomUuid = () => v4().toUpperCase();

const MOCK_MHS_OUTBOUND_URL = 'http://localhost/mhs-outbound';
const MOCK_SDS_FHIR_URL = 'http://localhost/sds-fhir';
const FAKE_REPO_ASID_CODE = 'fake_repo_asid_code';
const FAKE_DEST_ASID_CODE = 'fake_dest_asid_code';
const FAKE_REPO_ODS_CODE = 'B85002';
const FAKE_DEST_ODS_CODE = 'M85019';

// TODO: move this to utils file
const loadTestFileAndFillIds = (filename, { conversationId, messageId, ehrRequestId }) => {
  const filepath = path.join(__dirname, 'data', filename);
  const jsonString = readFileSync(filepath, 'utf8')
    .replaceAll('__CONVERSATION_ID__', conversationId)
    .replaceAll('__MESSAGE_ID__', messageId)
    .replaceAll('__EHR_REQUEST_ID__', ehrRequestId)
    .replaceAll('__REPO_ASID_CODE__', FAKE_REPO_ASID_CODE)
    .replaceAll('__REPO_ODS_CODE__', FAKE_REPO_ODS_CODE)
    .replaceAll('__DEST_ASID_CODE__', FAKE_DEST_ASID_CODE)
    .replaceAll('__DEST_ODS_CODE__', FAKE_DEST_ODS_CODE);
  return JSON.parse(jsonString);
};

const generateTestData = () => {
  return {
    conversationId: randomUuid(),
    messageId: randomUuid(),
    ehrRequestId: randomUuid(),
    mhsOutboundUrl: 'http://localhost/mhs-outbound',
    sdsFhirUrl: 'http://localhost/sds-fhir',
    repoAsidCode: 'fake_repo_asid_code',
    destAsidCode: 'fake_dest_asid_code',
    repoOdsCode: 'B85002',
    destOdsCode: 'M85019'
  };
};

const createMockMHSScope = () => {
  const body = {};
  const headers = {};

  const scope = nock(MOCK_MHS_OUTBOUND_URL)
    .post('')
    .reply(function (_, requestBody) {
      Object.assign(body, requestBody);
      Object.assign(headers, this.req.headers);
      return [200, 'OK'];
    });

  scope.outboundBody = body;
  scope.outboundHeaders = headers;
  return scope;
};

describe('logOutboundMessage', () => {
  const fakeAuthKey = 'fake-auth-key';

  beforeEach(() => {
    process.env.API_KEY_FOR_TEST_USER = fakeAuthKey;
    process.env.GP2GP_MESSENGER_MHS_OUTBOUND_URL = MOCK_MHS_OUTBOUND_URL;
    process.env.SDS_FHIR_URL = MOCK_SDS_FHIR_URL;
    process.env.SDS_FHIR_API_KEY = 'fake-sds-api-key';
    process.env.GP2GP_MESSENGER_REPOSITORY_ASID = FAKE_REPO_ASID_CODE;
    process.env.GP2GP_MESSENGER_REPOSITORY_ODS_CODE = FAKE_REPO_ODS_CODE;
  });

  const testCases = [
    { messageType: EhrMessageType.core, interactionId: 'RCMR_IN030000UK06' },
    { messageType: EhrMessageType.fragment, interactionId: 'COPC_IN000001UK01' }
  ];

  describe.each(testCases)('Test case for EHR $messageType', ({ messageType, interactionId }) => {
    it(`should log outbound message with all base64 contents removed`, async () => {
      // given
      const testData = generateTestData();
      const { conversationId, messageId } = testData;
      const ehrMessage = loadTestFileAndFillIds(`TestEhr${messageType}`, testData);
      const expectedOutboundMessageBody = loadTestFileAndFillIds(
        `expectedOutbound${messageType}Body`,
        testData
      );
      const mockRequestBody = buildPostRequestBody(messageType, ehrMessage, testData);
      // const mockRequestBody = {
      //   conversationId,
      //   messageId,
      //   odsCode
      // };

      // if (messageType === 'core') {
      //   mockRequestBody.coreEhr = ehrMessage;
      //   mockRequestBody.ehrRequestId = ehrRequestId;
      // } else {
      //   mockRequestBody.fragmentMessage = ehrMessage;
      // }

      // expect(fakeMockRequestBody).toEqual(mockRequestBody);

      // when
      const sdsFhirScope = createMockFhirScope(testData);
      const mhsAdaptorScope = createMockMHSScope();

      const response = await request(app)
        .post(`/ehr-out-transfers/${messageType}`)
        .set('Authorization', fakeAuthKey)
        .send(mockRequestBody);

      // then
      expect(logInfo).toBeCalled();
      expect(sdsFhirScope.isDone()).toBe(true);
      expect(mhsAdaptorScope.isDone()).toBe(true);
      expect(response.statusCode).toBe(204);

      // extract the relevant log with outbound message from all arguments that logInfo was called with.
      const outboundMessageInLog = logInfo.mock.calls
        .map(args => args[0])
        .filter(loggedObject => loggedObject?.body?.payload?.includes(interactionId))
        .pop();

      // verify that the log does exist and is under 256KB
      expect(outboundMessageInLog).not.toEqual(undefined);
      expect(isSmallerThan256KB(outboundMessageInLog)).toBe(true);

      // compare the logged content with what we expected
      expect(outboundMessageInLog.body).toEqual(expectedOutboundMessageBody);
      expect(outboundMessageInLog.headers).toMatchObject({
        'correlation-id': conversationId,
        'interaction-id': interactionId,
        'message-id': messageId,
        'ods-code': FAKE_DEST_ODS_CODE,
        'from-asid': FAKE_REPO_ASID_CODE
      });

      // Verify the logged content is same as the post request of gp2gp messenger --> outbound MHS adaptor
      // payload (the hl7v3 xml part) and external_attachments should be identical
      expect(outboundMessageInLog.body.payload).toEqual(mhsAdaptorScope.outboundBody.payload);
      expect(outboundMessageInLog.body.external_attachments).toEqual(
        mhsAdaptorScope.outboundBody.external_attachments
      );

      // attachment are not exactly equal, as the one in logs got base64 contents removed.
      // other than the base64 payloads, they should be the same
      expect(outboundMessageInLog.body.attachments).not.toEqual(
        mhsAdaptorScope.outboundBody.attachments
      );
      expect(outboundMessageInLog.body.attachments).toEqual(
        removeBase64Payloads(mhsAdaptorScope.outboundBody.attachments)
      );
    });

    it('should keep the base64 content in the actual outbound post request unchanged', async () => {
      // given
      const testData = generateTestData();
      const ehrMessage = loadTestFileAndFillIds(`TestEhr${messageType}`, testData);
      const mockRequestBody = buildPostRequestBody(messageType, ehrMessage, testData);

      // when
      createMockFhirScope(testData);
      const mhsAdaptorScope = createMockMHSScope();

      await request(app)
        .post(`/ehr-out-transfers/${messageType}`)
        .set('Authorization', fakeAuthKey)
        .send(mockRequestBody);

      // then
      // verify that the base64 payload in the outbound post request body is still intact
      expect(isSmallerThan256KB(mhsAdaptorScope.outboundBody)).toBe(false);
      mhsAdaptorScope.outboundBody.attachments.forEach((attachment, index) => {
        expect(attachment.payload).toEqual(ehrMessage.attachments[index].payload);
      });
    });
  });

  // describe.skip('case of sending a EHR fragment', () => {
  //   it('should log the outbound COPC fragment message with all base64 contents removed', async () => {
  //     // given
  //     const fragmentMessage = loadTestFileAndFillIds('TestEhrFragment', ids);
  //     const expectedOutboundFragmentBody = loadTestFileAndFillIds(
  //       'expectedOutboundFragmentBody',
  //       ids
  //     );
  //
  //     const mockRequestBody = {
  //       conversationId,
  //       odsCode,
  //       fragmentMessage,
  //       messageId
  //     };
  //
  //     // when
  //     const sdsFhirScope = createMockFhirScope();
  //     const mhsAdaptorScope = createMockMHSScope();
  //
  //     const response = await request(app)
  //       .post('/ehr-out-transfers/fragment')
  //       .set('Authorization', authKey)
  //       .send(mockRequestBody);
  //
  //     // then
  //     expect(logInfo).toBeCalled();
  //     expect(sdsFhirScope.isDone()).toBe(true);
  //     expect(mhsAdaptorScope.isDone()).toBe(true);
  //     expect(response.statusCode).toBe(204);
  //
  //     // extract the log with outbound COPC message from all arguments that logInfo was called with.
  //     const outboundMessageInLog = logInfo.mock.calls
  //       .map(args => args[0])
  //       .filter(
  //         loggedObject =>
  //           loggedObject?.body?.payload && loggedObject?.body?.payload.includes('COPC_IN000001UK01')
  //       )
  //       .pop();
  //
  //     // verify that the log does exist and is under 256KB
  //     expect(outboundMessageInLog).not.toEqual(undefined);
  //     expect(isSmallerThan256KB(outboundMessageInLog)).toBe(true);
  //
  //     // compare the logged content with what we expected
  //     expect(outboundMessageInLog.body).toEqual(expectedOutboundFragmentBody);
  //     expect(outboundMessageInLog.headers).toMatchObject({
  //       'correlation-id': conversationId,
  //       'interaction-id': 'COPC_IN000001UK01',
  //       'message-id': messageId,
  //       'ods-code': FAKE_DEST_ODS_CODE,
  //       'from-asid': FAKE_REPO_ASID_CODE
  //     });
  //
  //     // verify the logged content match with what comes out from gp2gp messenger
  //     expect(outboundMessageInLog.body.payload).toEqual(mhsAdaptorScope.postRequestBody.payload);
  //     expect(outboundMessageInLog.body.external_attachments).toEqual(
  //       mhsAdaptorScope.postRequestBody.external_attachments
  //     );
  //
  //     // The attachment are not exactly equal, as the one in logs got base64 contents removed.
  //     // Other than that, the logged attachments should be same as the actual attachments in outbound post request
  //     expect(outboundMessageInLog.body.attachments).not.toEqual(
  //       mhsAdaptorScope.postRequestBody.attachments
  //     );
  //     expect(outboundMessageInLog.body.attachments).toEqual(
  //       removeBase64Payloads(mhsAdaptorScope.postRequestBody.attachments)
  //     );
  //   });
  //
  //   it('should keep the base64 content in the actual outbound post request unchanged', async () => {
  //     // given
  //     const fragmentMessage = loadTestFileAndFillIds('TestEhrFragment', ids);
  //
  //     const mockRequestBody = {
  //       conversationId,
  //       odsCode,
  //       fragmentMessage,
  //       messageId
  //     };
  //
  //     // when
  //     createMockFhirScope();
  //     const mhsAdaptorScope = createMockMHSScope();
  //
  //     await request(app)
  //       .post('/ehr-out-transfers/fragment')
  //       .set('Authorization', authKey)
  //       .send(mockRequestBody);
  //
  //     // then
  //     // verify that the base64 payload in the outbound post request body is still intact
  //     expect(isSmallerThan256KB(mhsAdaptorScope.postRequestBody)).toBe(false);
  //     mhsAdaptorScope.postRequestBody.attachments.forEach((attachment, index) => {
  //       expect(attachment.payload).toEqual(fragmentMessage.attachments[index].payload);
  //     });
  //   });
  // });
  //
  // describe.skip('case of sending a EHR core', () => {
  //   it('should log the outbound EHR core message with all base64 contents removed', async () => {
  //     // given
  //     const coreEhr = loadTestFileAndFillIds('TestEhrCore', ids);
  //     const expectedOutboundMessage = loadTestFileAndFillIds('ExpectedOutboundCoreBody', ids);
  //
  //     const mockRequestBody = {
  //       conversationId,
  //       odsCode,
  //       coreEhr,
  //       messageId,
  //       ehrRequestId
  //     };
  //
  //     // when
  //     const sdsFhirScope = createMockFhirScope();
  //     const mhsAdaptorScope = createMockMHSScope();
  //
  //     const response = await request(app)
  //       .post('/ehr-out-transfers/core')
  //       .set('Authorization', authKey)
  //       .send(mockRequestBody);
  //
  //     // then
  //     expect(logInfo).toBeCalled();
  //     expect(sdsFhirScope.isDone()).toBe(true);
  //     expect(mhsAdaptorScope.isDone()).toBe(true);
  //     expect(response.statusCode).toBe(204);
  //
  //     // extract the log with outbound UK06 message from all arguments that logInfo was called with.
  //     const outboundMessageInLog = logInfo.mock.calls
  //       .map(args => args[0])
  //       .filter(
  //         loggedObject =>
  //           loggedObject?.body?.payload && loggedObject?.body?.payload.includes('RCMR_IN030000UK06')
  //       )
  //       .pop();
  //
  //     // verify that the log does exist and is under 256KB
  //     expect(outboundMessageInLog).not.toEqual(undefined);
  //     expect(isSmallerThan256KB(outboundMessageInLog)).toBe(true);
  //
  //     // compare the logged content with what we expected
  //     expect(outboundMessageInLog.body).toEqual(expectedOutboundMessage);
  //     expect(outboundMessageInLog.headers).toMatchObject({
  //       'correlation-id': conversationId,
  //       'interaction-id': 'RCMR_IN030000UK06',
  //       'message-id': messageId,
  //       'ods-code': FAKE_DEST_ODS_CODE,
  //       'from-asid': FAKE_REPO_ASID_CODE
  //     });
  //
  //     // verify the logged content match with what comes out from gp2gp messenger
  //     expect(outboundMessageInLog.body.payload).toEqual(mhsAdaptorScope.postRequestBody.payload);
  //     expect(outboundMessageInLog.body.external_attachments).toEqual(
  //       mhsAdaptorScope.postRequestBody.external_attachments
  //     );
  //     expect(outboundMessageInLog.headers).toEqual(mhsAdaptorScope.postRequestHeaders);
  //
  //     // The attachment are not exactly equal, as the one in logs got base64 contents removed.
  //     // Other than that, the logged attachments should be same as the actual attachments in outbound post request
  //     expect(outboundMessageInLog.body.attachments).not.toEqual(
  //       mhsAdaptorScope.postRequestBody.attachments
  //     );
  //     expect(outboundMessageInLog.body.attachments).toEqual(
  //       removeBase64Payloads(mhsAdaptorScope.postRequestBody.attachments)
  //     );
  //   });
  //
  //   it('should keep the base64 content in the actual outbound post request unchanged', async () => {
  //     // given
  //     const coreEhr = loadTestFileAndFillIds('TestEhrCore', ids);
  //
  //     const mockRequestBody = {
  //       conversationId,
  //       odsCode,
  //       coreEhr,
  //       messageId,
  //       ehrRequestId
  //     };
  //
  //     // when
  //     createMockFhirScope();
  //     const mhsAdaptorScope = createMockMHSScope();
  //
  //     const res = await request(app)
  //       .post('/ehr-out-transfers/core')
  //       .set('Authorization', authKey)
  //       .send(mockRequestBody);
  //
  //     // then
  //     // verify that the base64 payload in the outbound post request body is still intact
  //     expect(isSmallerThan256KB(mhsAdaptorScope.postRequestBody)).toBe(false);
  //     mhsAdaptorScope.postRequestBody.attachments.forEach((attachment, index) => {
  //       expect(attachment.payload).toEqual(coreEhr.attachments[index].payload);
  //     });
  //   });
  // });
});
