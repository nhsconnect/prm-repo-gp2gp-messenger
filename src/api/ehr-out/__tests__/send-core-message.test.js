import { getPracticeAsid } from '../../../services/fhir/sds-fhir-client';
import { updateExtractForSending } from '../../../services/parser/message/update-extract-for-sending';
import { wrangleAttachments } from '../../../services/mhs/mhs-attachments-wrangler';
import request from 'supertest';
import { v4 } from '../../../__mocks__/uuid';
import app from '../../../app';
import { sendMessage } from '../../../services/mhs/mhs-outbound-client';

jest.mock('../../../services/fhir/sds-fhir-client');
jest.mock('../../../services/parser/message/update-extract-for-sending');
jest.mock('../../../services/mhs/mhs-outbound-client');
jest.mock('../../../services/mhs/mhs-attachments-wrangler');
jest.mock('../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    consumerApiKeys: { TEST_USER: 'correct-key' },
    deductionsOdsCode: 'test_odscode'
  })
}));

const authKey = 'correct-key';
const conversationId = v4();
const mockRequestBodyWithMissingPayload = {
  conversationId: conversationId,
  odsCode: 'testOdsCode',
  ehrRequestId: 'ehrRequestId',
  coreEhr: 'core ehr stored in ehr repository'
};

const mockRequestBody = {
  conversationId: conversationId,
  odsCode: 'testOdsCode',
  ehrRequestId: 'ehrRequestId',
  coreEhr: { ebXML: 'ebxml', payload: 'payload', attachments: [] }
};
describe('ehr out transfers', () => {
  const odsCode = 'testOdsCode';
  const interactionId = 'RCMR_IN030000UK06';
  const serviceId = `urn:nhs:names:services:gp2gp:${interactionId}`;
  it('should call getPracticeAsid', async () => {
    const res = await request(app)
      .post('/ehr-out-transfers/core')
      .set('Authorization', authKey)
      .send(mockRequestBody);
    expect(res.status).toBe(204);
    expect(getPracticeAsid).toHaveBeenCalledWith(odsCode, serviceId);
  });

  it('should throw an error when there is no payload in the ehr core message', async () => {
    const res = await request(app)
      .post('/ehr-out-transfers/core')
      .set('Authorization', authKey)
      .send(mockRequestBodyWithMissingPayload);

    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      errors: [
        'Sending EHR Extract failed',
        'Could not extract payload from the JSON message stored in EHR Repo'
      ]
    });
  });

  it('should invoke updateExtractForSending, wrangleAttachments and sendMessage', async () => {
    getPracticeAsid.mockReturnValue('mockAsid');
    updateExtractForSending.mockReturnValue('payload');
    wrangleAttachments.mockReturnValue({
      attachments: 'outboundAttachments',
      external_attachments: 'outboundExternalAttachments'
    });

    const res = await request(app)
      .post('/ehr-out-transfers/core')
      .set('Authorization', authKey)
      .send(mockRequestBody);

    expect(updateExtractForSending).toHaveBeenCalledWith(
      mockRequestBody.coreEhr.payload,
      mockRequestBody.ehrRequestId,
      'mockAsid',
      'test_odscode'
    );
    expect(wrangleAttachments).toHaveBeenCalledWith(mockRequestBody.coreEhr);
    expect(sendMessage).toHaveBeenCalledWith({
      conversationId: '00000000-0000-4000-a000-000000000000',
      interactionId: 'RCMR_IN030000UK06',
      message: 'payload',
      odsCode: 'testOdsCode',
      attachments: 'outboundAttachments',
      external_attachments: 'outboundExternalAttachments'
    });
    expect(res.status).toBe(204);
  });
});
