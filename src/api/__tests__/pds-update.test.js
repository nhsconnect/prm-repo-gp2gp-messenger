import { when } from 'jest-when';
import request from 'supertest';
import uuid from 'uuid/v4';
import app from '../../app';
import config from '../../config';
import generateUpdateOdsRequest from '../../templates/generate-update-ods-request';
import { updateLogEvent } from '../../middleware/logging';
import { sendMessage } from '../../services/mhs/mhs-outbound-client';
import { validatePdsResponse } from '../../services/pds/pds-response-validator';
import { parsePdsResponse } from '../../services/pds/pds-response-handler';

jest.mock('../../services/pds/pds-response-validator');
jest.mock('../../services/pds/pds-response-handler');
jest.mock('../../config/logging');
jest.mock('../../middleware/logging');
jest.mock('../../services/mhs/mhs-outbound-client');
jest.mock('../../templates/generate-update-ods-request');
jest.mock('uuid/v4');

const fakerequest =
  '<PRPA_IN000203UK03 xmlns="urn:hl7-org:v3" xmlns:hl7="urn:hl7-org:v3"></PRPA_IN000203UK03>';

const sendMessageErrorMessage =
  '<PRPA_IN000203UK03 xmlns="urn:hl7-org:v3" xmlns:hl7="urn:hl7-org:v3"><Error></Error></PRPA_IN000203UK03>';

const testSerialChangeNumber = '2';

const message = `<hl7:interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="PRPA_IN000202UK01"/><PdsSuccessfulUpdateResponse xmlns="urn:hl7-org:v3" xmlns:soapcsf="http://www.w3.org/2001/12/soap-envelope" xmlns:eb="http://www.oasis-open.org/committees/ebxml-msg/schema/msg-header-2_0.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:nasp="http://spine.nhs.uk/spine-servicev1.0" xmlns:soap="http://www.w3.org/2001/12/soap-envelope" classCode="REG" moodCode="EVN">
<pertinentInformation typeCode="PERT">
  <pertinentSerialChangeNumber classCode="OBS" moodCode="EVN">
    <code code="2" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.35"/>
    <value value="${testSerialChangeNumber}/>
  </pertinentSerialChangeNumber>
</pertinentInformation>
</PdsSuccessfulUpdateResponse>`;

const interactionId = 'PRPA_IN000203UK03';
const mockUUID = 'ebf6ee70-b9b7-44a6-8780-a386fccd759c';
const mockNoPatientUID = 'ebf6ee70-b9b7-64a6-8780-a386fccd759d';
const mockErrorUUID = 'fd9271ea-9086-4f7e-8993-0271518fdb6f';

function generateLogEvent(message) {
  return {
    status: 'validation-failed',
    validation: {
      errors: message,
      status: 'failed'
    }
  };
}

describe('POST /pds-update/:serialChangeNumber/:pdsId/:nhsNumber', () => {
  beforeEach(() => {
    process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';
    config.pdsAsid = 'pdsAsid';
    config.deductionsAsid = 'deductionsAsid';
    config.deductionsOdsCode = 'deductionsOdsCode';
    uuid.mockImplementation(() => mockUUID);

    validatePdsResponse.mockResolvedValue(Promise.resolve(true));
    parsePdsResponse.mockResolvedValue(Promise.resolve({}));

    when(sendMessage)
      .calledWith({ interactionId, conversationId: mockUUID.toUpperCase(), message: fakerequest })
      .mockResolvedValue({ status: 200, data: message })
      .calledWith({
        interactionId,
        conversationId: mockUUID.toUpperCase(),
        message: sendMessageErrorMessage
      })
      .mockRejectedValue(Error('rejected'))
      .calledWith({
        interactionId,
        conversationId: mockErrorUUID.toUpperCase(),
        message: fakerequest
      })
      .mockResolvedValue({ status: 500, data: '500 MHS Error' })
      .calledWith({
        interactionId,
        conversationId: mockNoPatientUID.toUpperCase(),
        message: fakerequest
      })
      .mockResolvedValue({ status: 200, data: 'no patient details' });

    generateUpdateOdsRequest.mockResolvedValue(fakerequest);
  });

  it('should return a 200 if :nhsNumber is numeric and 10 digits and Authorization Header provided', done => {
    request(app)
      .post('/pds-update/123/cppz/9442964410')
      .set('Authorization', 'correct-key')
      .expect(200)
      .end(done);
  });
  it('should return a 401 when no authorization header provided', done => {
    request(app)
      .post('/pds-update/123/cppz/9442964410')
      .expect(401)
      .end(done);
  });
  it('should return a 403 when authorization key is incorrect', done => {
    request(app)
      .post('/pds-update/123/cppz/9442964410')
      .set('Authorization', 'incorrect-key')
      .expect(403)
      .end(done);
  });
  it('should return an error if :nhsNumber is less than 10 digits', done => {
    const errorMessage = [{ nhsNumber: "'nhsNumber' provided is not 10 characters" }];
    request(app)
      .post('/pds-update/123/cppz/944410')
      .set('Authorization', 'correct-key')
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).toEqual({
          errors: errorMessage
        });
        expect(updateLogEvent).toHaveBeenCalledTimes(1);
        expect(updateLogEvent).toHaveBeenCalledWith(generateLogEvent(errorMessage));
      })
      .end(done);
  });

  // it('should return a 503 if sendMessage throws an error', done => {
  //   generateUpdateOdsRequest.mockResolvedValue(sendMessageErrorMessage);

  //   request(app)
  //     .get('/pds-update/123/cppz/9442964410')
  //     .set('Authorization', 'correct-key')
  //     .expect(res => {
  //       expect(res.status).toBe(503);
  //       expect(res.body.errors).toBe('rejected');
  //     })
  //     .end(done);
  // });
});
