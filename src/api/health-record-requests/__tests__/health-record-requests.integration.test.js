import request from 'supertest';
import app from '../../../app';
import axios from 'axios';
import { generateEhrRequestQuery } from '../../../templates/ehr-request-template';

jest.mock('../../../middleware/logging');
jest.mock('axios');
jest.mock('../../../middleware/auth');
jest.mock('../../../templates/ehr-request-template', () => ({
  generateEhrRequestQuery: jest.fn().mockResolvedValue('message')
}));

const nhsNumber = '1111111111';
const repositoryOdsCode = '12';
const repositoryAsid = '64834';
const practiceOdsCode = '098';
const practiceAsid = '09';

const mockBody = { repositoryOdsCode, repositoryAsid, practiceOdsCode, practiceAsid };

describe('POST /health-record-requests/:nhsNumber', () => {
  it('should generate ehr request query', done => {
    axios.post.mockImplementation(() => Promise.resolve({ status: 200 }));
    request(app)
      .post(`/health-record-requests/${nhsNumber}`)
      .send(mockBody)
      .expect(() => {
        expect(generateEhrRequestQuery).toHaveBeenCalledWith({
          id: expect.anything(),
          timestamp: expect.anything(),
          receivingService: {
            asid: practiceAsid,
            odsCode: practiceOdsCode
          },
          sendingService: {
            asid: repositoryAsid,
            odsCode: repositoryOdsCode
          },
          patient: {
            nhsNumber
          }
        });
      })
      .end(done);
  });
});
