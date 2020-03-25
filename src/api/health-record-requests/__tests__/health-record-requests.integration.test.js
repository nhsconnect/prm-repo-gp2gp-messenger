import request from 'supertest';
import app from '../../../app';
import axios from 'axios';
import generateEhrRequestQuery from '../../../templates/ehr-request-template';

jest.mock('../../../middleware/logging');
jest.mock('axios');
jest.mock('../../../middleware/auth');
jest.mock('../../../templates/ehr-request-template');

const nhsNumber = '1111111111';
const repositoryOdsCode = '12';
const repositoryAsid = '64834';
const practiceOdsCode = '098';
const practiceAsid = '09';

const mockBody = { repositoryOdsCode, repositoryAsid, practiceOdsCode, practiceAsid };

describe('POST /health-record-requests/:nhsNumber', () => {
  beforeEach(() => {
    generateEhrRequestQuery.mockResolvedValue('message');
  });

  it('should generate ehr request query', done => {
    axios.post.mockResolvedValue({ status: 204 });
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

  it('should error when send message fails', done => {
    axios.post.mockRejectedValue({ status: 500 });
    request(app)
      .post(`/health-record-requests/${nhsNumber}`)
      .send(mockBody)
      .expect(503)
      .expect(res => {
        expect(res.body).toEqual(
          expect.objectContaining({
            errors: expect.arrayContaining(['Sending EHR Request has failed'])
          })
        );
      })
      .end(done);
  });
});
