import request from 'supertest';

import app from '../../../app';
import { logInfo } from '../../../middleware/logging';
import { removeBase64Payloads } from '../logging-utils';
import {
  EhrMessageType,
  TestConstants,
  buildPostRequestBody,
  createMockFhirScope,
  createMockMHSScope,
  generateTestData,
  isSmallerThan256KB,
  setupEnvVarsForTest, buildInboundMessage, buildExpectedOutboundMessageBody
} from './test_utils';

jest.mock('../../../middleware/logging');
jest.mock('../../../services/sqs/sqs-client');

describe('logOutboundMessage', () => {
  const fakeAuthKey = 'fake-auth-key';

  beforeAll(() => {
    setupEnvVarsForTest();
  });

  const testCases = [
    { messageType: EhrMessageType.core, interactionId: 'RCMR_IN030000UK06' },
    { messageType: EhrMessageType.fragment, interactionId: 'COPC_IN000001UK01' }
  ];

  describe.each(testCases)('Test case for EHR $messageType', ({ messageType, interactionId }) => {
    it(`should log outbound message with all base64 contents removed`, async () => {
      // given
      const testUUIDs = generateTestData();
      const { conversationId, messageId } = testUUIDs;
      const ehrMessage = buildInboundMessage(messageType, testUUIDs);
      const expectedOutboundMessageBody = buildExpectedOutboundMessageBody(messageType, testUUIDs);
      const mockRequestBody = buildPostRequestBody(messageType, ehrMessage, testUUIDs);
      // when
      const sdsFhirScope = createMockFhirScope();
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
        'ods-code': TestConstants.destOdsCode,
        'from-asid': TestConstants.repoAsidCode
      });

      // Verify the logging correctly capture the post request of gp2gp messenger --> outbound MHS adaptor
      expect(outboundMessageInLog.headers).toEqual(mhsAdaptorScope.outboundHeaders)
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
      const testUUIDs = generateTestData();
      const ehrMessage = buildInboundMessage(messageType, testUUIDs);
      const mockRequestBody = buildPostRequestBody(messageType, ehrMessage, testUUIDs);

      // when
      createMockFhirScope();
      const mhsAdaptorScope = createMockMHSScope();

      await request(app)
        .post(`/ehr-out-transfers/${messageType}`)
        .set('Authorization', fakeAuthKey)
        .send(mockRequestBody);

      // then
      expect(logInfo).toBeCalled();
      expect(mhsAdaptorScope.isDone()).toBe(true);

      // verify that the base64 contents in the actual post request body sent to MHS adaptor is unchanged
      expect(isSmallerThan256KB(mhsAdaptorScope.outboundBody)).toBe(false);
      expect(mhsAdaptorScope.outboundBody.attachments.length).toBeGreaterThan(0);
      mhsAdaptorScope.outboundBody.attachments.forEach((attachment, index) => {
        const base64ContentFromOutbound = attachment.payload;
        const base64ContentFromOriginFile = ehrMessage.attachments[index].payload;
        expect(base64ContentFromOutbound).toEqual(base64ContentFromOriginFile);
      });
    });
  });
});
