import request from 'supertest';
import { v4 } from '../../../__mocks__/uuid';
import app from '../../../app';

jest.mock('../../../config', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    consumerApiKeys: { TEST_USER: 'correct-key' },
    deductionsOdsCode: 'test_odscode'
  })
}));

const authKey = 'correct-key';
const conversationId = v4();
const mockRequestBody = {
  conversationId: conversationId,
  odsCode: 'testOdsCode',
  messageId: v4(),
  fragmentMessage: 'fragment message'
};
describe('ehr out transfers', () => {
  it('should call getPracticeAsid', async () => {
    const res = await request(app)
      .post('/ehr-out-transfers/fragment')
      .set('Authorization', authKey)
      .send(mockRequestBody);
    expect(res.status).toBe(204);
  });
});
