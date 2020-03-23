import request from 'supertest';
import app from '../../../app';
jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');

describe('POST /health-record-requests/:nhsNumber', () => {
    it('should return a 200', done => {
        request(app)
            .post('/health-record-requests/1234567890')
            .expect(200)
            .end(done);
    });
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
                expect(res.body).toEqual(expect.objectContaining({
                    errors: expect.arrayContaining([{ nhsNumber: "'nhsNumber' provided is not 10 digits" }])
                }))
            })
            .end(done);
    });
    it('should return correct error message if nhsNumber is not numeric', done => {
        request(app)
            .post('/health-record-requests/xxxxxxxxxx')
            .expect(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    errors: expect.arrayContaining([{ nhsNumber: "'nhsNumber' provided is not numeric" }])
                }))
            })
            .end(done);
    });

});
