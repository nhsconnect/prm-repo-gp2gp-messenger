import request from 'supertest';
import { v4 } from '../../../__mocks__/uuid';
import app from '../../../app';
import { getPracticeAsid } from '../../../services/fhir/sds-fhir-client';
import { updateFragmentForSending } from '../../../services/parser/message/update-fragment-for-sending';
import { sendMessage } from '../../../services/mhs/mhs-outbound-client';
import { removeTitleFromExternalAttachments } from '../../../services/mhs/mhs-attachments-wrangler';

jest.mock('../../../services/mhs/mhs-outbound-client');
jest.mock('../../../services/parser/message/update-fragment-for-sending');
jest.mock('../../../services/fhir/sds-fhir-client');
jest.mock('../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    consumerApiKeys: { TEST_USER: 'correct-key' },
    deductionsOdsCode: 'test_odscode'
  })
}));
jest.mock('../../../services/mhs/mhs-attachments-wrangler');

const authKey = 'correct-key';
const conversationId = v4();

const externalAttachmentWithTitle = {
  message_id: '5678',
  document_id: 'CA0F6E92-592E-4491-9ECC-2E0C77C90BE4',
  title: 'title',
  description: 'description'
};

const externalAttachmentWithoutTitle = {
  message_id: '5678',
  document_id: 'CA0F6E92-592E-4491-9ECC-2E0C77C90BE4',
  description: 'description'
};
const mockRequestBody = {
  conversationId: conversationId,
  odsCode: 'testOdsCode',
  messageId: v4(),
  fragmentMessage: {
    ebXML: 'ebxml',
    payload: 'payload',
    attachments: [[{ message_id: '1234' }]],
    external_attachments: [externalAttachmentWithTitle, externalAttachmentWithTitle]
  }
};

const mockRequestBodyWithMissingPayload = {
  conversationId: conversationId,
  odsCode: 'testOdsCode',
  messageId: v4(),
  fragmentMessage: {
    ebXML: 'ebxml',
    attachments: [[{ message_id: '1234' }]],
    external_attachments: [externalAttachmentWithTitle, externalAttachmentWithTitle]
  }
};

const missingExternalAttachmentsInFragment = {
  conversationId: v4(),
  messageId: v4(),
  odsCode: 'ods-code',
  fragmentMessage: {
    ebXML: 'ebxml',
    payload: 'payload',
    attachments: [[{ message_id: '1234' }]]
  }
};

describe('ehr out transfers send fragment message', () => {
  const COPC_INTERACTION_ID = 'COPC_IN000001UK01';
  const serviceId = `urn:nhs:names:services:gp2gp:${COPC_INTERACTION_ID}`;
  it('should call getPracticeAsid', async () => {
    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send(mockRequestBody);
    expect(res.status).toBe(204);
    expect(getPracticeAsid).toHaveBeenCalledWith('testOdsCode', serviceId);
  });

  it('should call updateFragmentForSending', async () => {
    getPracticeAsid.mockReturnValueOnce('mock-asid');
    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send(mockRequestBody);
    expect(res.status).toBe(204);
    expect(updateFragmentForSending).toHaveBeenCalledWith(
      mockRequestBody.fragmentMessage.payload,
      mockRequestBody.messageId,
      'mock-asid',
      mockRequestBody.odsCode
    );
  });

  it('should call sendMessage', async () => {
    // when
    getPracticeAsid.mockReturnValueOnce('mock-asid');
    updateFragmentForSending.mockReturnValueOnce('anything');
    removeTitleFromExternalAttachments.mockReturnValueOnce([
      externalAttachmentWithoutTitle,
      externalAttachmentWithoutTitle
    ]);

    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send(mockRequestBody);

    // then
    expect(res.status).toBe(204);
    expect(sendMessage).toHaveBeenCalledWith({
      interactionId: COPC_INTERACTION_ID,
      conversationId: mockRequestBody.conversationId,
      odsCode: mockRequestBody.odsCode,
      message: 'anything',
      attachments: mockRequestBody.fragmentMessage.attachments,
      external_attachments: [externalAttachmentWithoutTitle, externalAttachmentWithoutTitle]
    });
  });

  it('should return status code 500 and log error message when encounters exception', async () => {
    getPracticeAsid.mockImplementationOnce(() => {
      throw new Error('No ASID entries found for ODS code');
    });
    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send(mockRequestBodyWithMissingPayload);

    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      errors: ['Sending Ehr fragment message failed', 'No ASID entries found for ODS code']
    });
  });

  it('should give error response code 422 when conversation id is not a uuid', async () => {
    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send({ ...mockRequestBody, conversationId: 'non-uuid' });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      errors: [{ conversationId: "'conversationId' provided is not of type UUID" }]
    });
  });

  it('should give error response code 422 when messageId id is not a uuid', async () => {
    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send({ ...mockRequestBody, messageId: 'non-uuid' });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({ errors: [{ messageId: 'Provided value is not of type UUID' }] });
  });

  it('should give error response code 422 when ods code is empty', async () => {
    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send({ ...mockRequestBody, odsCode: '' });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({ errors: [{ odsCode: 'Value has not been provided' }] });
  });

  it('should give error response code 422 when fragment Message is empty', async () => {
    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send({ ...mockRequestBody, fragmentMessage: '' });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({ errors: [{ fragmentMessage: 'Value has not been provided' }] });
  });

  it('should be able to send fragment message without external attachments', async () => {
    // given
    getPracticeAsid.mockReturnValueOnce('mock-asid');
    const expectedMessage = {
      interactionId: COPC_INTERACTION_ID,
      conversationId: missingExternalAttachmentsInFragment.conversationId,
      odsCode: missingExternalAttachmentsInFragment.odsCode,
      message: 'anything',
      attachments: missingExternalAttachmentsInFragment.fragmentMessage.attachments,
      external_attachments: null
    };

    updateFragmentForSending.mockReturnValue(expectedMessage.message);

    // when
    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send(missingExternalAttachmentsInFragment);

    // then
    expect(res.status).toEqual(204);
    expect(sendMessage).toHaveBeenCalledWith(expectedMessage);
    expect(removeTitleFromExternalAttachments).not.toHaveBeenCalled();
  });
});
