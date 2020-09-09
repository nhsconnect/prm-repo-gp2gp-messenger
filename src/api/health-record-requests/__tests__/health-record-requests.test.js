import request from 'supertest';
import app from '../../../app';
import dateFormat from 'dateformat';
import { buildEhrRequest } from '../health-record-requests';
import generateEhrRequestQuery from '../../../templates/ehr-request-template';
import { v4 as uuid } from 'uuid';
import { sendMessage } from '../../../services/mhs/mhs-outbound-client';

jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');
jest.mock('../../../templates/ehr-request-template');
jest.mock('dateformat');
jest.mock('../../../services/mhs/mhs-outbound-client');

const mockUUID = 'ebf6ee70-b9b7-44a6-8780-a386fccd759c';
const mockTimestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');

describe('POST /health-record-requests/:nhsNumber', () => {
  beforeEach(() => {
    uuid.mockImplementation(() => mockUUID);
    generateEhrRequestQuery.mockResolvedValue('message');
  });

  describe('healthRecordRequests', () => {
    const body = {
      repositoryOdsCode: 'repo_ods_code',
      repositoryAsid: 'repo_asid',
      practiceOdsCode: 'practice_ods_code',
      practiceAsid: 'practice_asid'
    };

    it('should return a 204', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .expect(204)
        .send(body)
        .end(done);
    });

    it('should call sendMessage with interactionId', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .send(body)
        .expect(204)
        .expect(() => {
          expect(sendMessage).toHaveBeenCalledTimes(1);
          expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ interactionId: 'RCMR_IN010000UK05' })
          );
        })
        .end(done);
    });

    it('should call sendMessage with conversationId', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .send(body)
        .expect(204)
        .expect(() => {
          expect(sendMessage).toHaveBeenCalledTimes(1);
          expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ conversationId: mockUUID.toUpperCase() })
          );
        })
        .end(done);
    });

    it('should call sendMessage with generate ehr request message', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .send(body)
        .expect(204)
        .expect(() => {
          expect(sendMessage).toHaveBeenCalledTimes(1);
          expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ message: 'message' }));
        })
        .end(done);
    });

    it('should call sendMessage with target ods code message', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .send(body)
        .expect(204)
        .expect(() => {
          expect(sendMessage).toHaveBeenCalledTimes(1);
          expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ odsCode: body.practiceOdsCode })
          );
        })
        .end(done);
    });
  });

  describe('healthRecordRequestValidation', () => {
    it('should return a 422 if nhsNumber is not 10 digits', done => {
      request(app)
        .post('/health-record-requests/123456')
        .expect(422)
        .end(done);
    });

    it('should return correct error message if nhsNumber is not 10 digits', done => {
      request(app)
        .post('/health-record-requests/123456')
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              errors: expect.arrayContaining([
                { nhsNumber: "'nhsNumber' provided is not 10 digits" }
              ])
            })
          );
        })
        .end(done);
    });

    it('should return correct error message if nhsNumber is not numeric', done => {
      request(app)
        .post('/health-record-requests/xxxxxxxxxx')
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              errors: expect.arrayContaining([{ nhsNumber: "'nhsNumber' provided is not numeric" }])
            })
          );
        })
        .end(done);
    });

    it('should return correct error message if repository ods code is not configured', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              errors: expect.arrayContaining([
                { repositoryOdsCode: "'repositoryOdsCode' is not configured" }
              ])
            })
          );
        })
        .end(done);
    });

    it('should return correct error message if repository asid is not configured', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              errors: expect.arrayContaining([
                { repositoryAsid: "'repositoryAsid' is not configured" }
              ])
            })
          );
        })
        .end(done);
    });

    it('should return correct error message if practice ods code is not configured', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              errors: expect.arrayContaining([
                { practiceOdsCode: "'practiceOdsCode' is not configured" }
              ])
            })
          );
        })
        .end(done);
    });

    it('should return correct error message if practice asid is not configured', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .expect(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              errors: expect.arrayContaining([{ practiceAsid: "'practiceAsid' is not configured" }])
            })
          );
        })
        .end(done);
    });
  });

  describe('buildEhrRequest', () => {
    const practiceAsid = '1234567890';
    const practiceOdsCode = '123';
    const repositoryAsid = '0987654';
    const repositoryOdsCode = '098';
    const nhsNumber = '1111111111';
    const exampleRequest = {
      params: {
        nhsNumber
      },
      body: {
        practiceAsid,
        practiceOdsCode,
        repositoryAsid,
        repositoryOdsCode
      }
    };
    it('should call buildEhrRequest with valid id to generate request', async done => {
      await buildEhrRequest(exampleRequest, mockUUID);
      expect(generateEhrRequestQuery).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockUUID })
      );
      done();
    });

    it('should call buildEhrRequest with valid timestamp to generate request', async done => {
      dateFormat.mockImplementation(() => mockTimestamp);
      await buildEhrRequest(exampleRequest, mockUUID);
      expect(generateEhrRequestQuery).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: mockTimestamp })
      );
      done();
    });

    it('should call buildEhrRequest with receiving asid to generate request', async done => {
      await buildEhrRequest(exampleRequest, mockUUID);
      expect(generateEhrRequestQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          receivingService: expect.objectContaining({
            asid: practiceAsid
          })
        })
      );
      done();
    });

    it('should call buildEhrRequest with receiving ods code to generate request', async done => {
      await buildEhrRequest(exampleRequest, mockUUID);
      expect(generateEhrRequestQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          receivingService: expect.objectContaining({
            odsCode: practiceOdsCode
          })
        })
      );
      done();
    });

    it('should call buildEhrRequest with sending asid to generate request', async done => {
      await buildEhrRequest(exampleRequest, mockUUID);
      expect(generateEhrRequestQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          sendingService: expect.objectContaining({
            asid: repositoryAsid
          })
        })
      );
      done();
    });

    it('should call buildEhrRequest with sending ods code to generate request', async done => {
      await buildEhrRequest(exampleRequest, mockUUID);
      expect(generateEhrRequestQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          sendingService: expect.objectContaining({
            odsCode: repositoryOdsCode
          })
        })
      );
      done();
    });

    it('should call buildEhrRequest with patient nhsNumber to generate request', async done => {
      await buildEhrRequest(exampleRequest, mockUUID);
      expect(generateEhrRequestQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          patient: expect.objectContaining({
            nhsNumber
          })
        })
      );
      done();
    });
  });
});
