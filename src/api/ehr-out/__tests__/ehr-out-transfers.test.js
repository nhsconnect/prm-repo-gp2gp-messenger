import {getPracticeAsid} from '../../../services/fhir/sds-fhir-client';
import request from 'supertest';
import {v4} from '../../../__mocks__/uuid';
import app from '../../../app';

jest.mock('../../../services/fhir/sds-fhir-client');
jest.mock('../../../config', () => ({
    initializeConfig: jest.fn().mockReturnValue({
        consumerApiKeys: {TEST_USER: 'correct-key'}
    })
}));

const authKey = 'correct-key';
const conversationId = v4();
const mockRequestBody = {
    conversationId: conversationId,
    odsCode: 'testOdsCode',
    ehrRequestId: 'ehrRequestId',
    coreEhr: 'core ehr stored in ehr repository'
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
                .send(mockRequestBody);

            expect(res.status).toBe(503)
            expect(res.body).toEqual({
                errors: [
                    'Sending EHR Extract failed',
                    'Could not extract payload from the JSON message stored in EHR Repo'
                ]
            });
        }
    )
});
