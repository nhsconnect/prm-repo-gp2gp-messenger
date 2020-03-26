import { when } from 'jest-when';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import sendEhrRequest from '../api/ehr-request/send-ehr-request';
import app from '../app';
import config from '../config';
import { getHealthCheck } from '../services/health-check/get-health-check';
import { sendMessage } from '../services/mhs/mhs-outbound-client';
import generatePdsRetrievalQuery from '../templates/generate-pds-retrieval-request';
import generateUpdateOdsRequest from '../templates/generate-update-ods-request';

jest.mock('../api/ehr-request/send-ehr-request');
jest.mock('../config/logging');
jest.mock('../services/health-check/get-health-check');
jest.mock('../middleware/auth');
jest.mock('../services/mhs/mhs-outbound-client');
jest.mock('../templates/generate-pds-retrieval-request');
jest.mock('../templates/generate-update-ods-request');
jest.mock('../templates/ehr-request-template');

const testSerialChangeNumber = '2';
const testPatientPdsId = 'cppz';
const interactionId = 'QUPA_IN000008UK02';
const interactionIdUpdate = 'PRPA_IN000203UK03';
const mockUUID = 'ebf6ee70-b9b7-44a6-8780-a386fccd759c';
const fakerequest =
  '<QUPA_IN000008UK02 xmlns="urn:hl7-org:v3" xmlns:hl7="urn:hl7-org:v3"></QUPA_IN000008UK02>';
const fakerequestUpdate =
  '<PRPA_IN000203UK03 xmlns="urn:hl7-org:v3" xmlns:hl7="urn:hl7-org:v3"></PRPA_IN000203UK03>';
const message = `
  <PDSResponse xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" classCode="OBS" moodCode="EVN" xsi:schemaLocation="urn:hl7-org:v3 ../../Schemas/PRPA_MT000201UK03.xsd">
        <pertinentSerialChangeNumber classCode="OBS" moodCode="EVN">
          <code code="2" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.35"/>
          <value value="${testSerialChangeNumber}"/>
        </pertinentSerialChangeNumber>
      <patientCareProvisionEvent classCode="PCPR" moodCode="EVN">
        <code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.37" code="1"/>
        <effectiveTime>
          <low value="20140212"/>
        </effectiveTime>
        <id root="2.16.840.1.113883.2.1.3.2.4.18.1" extension="${testPatientPdsId}"/>
      </patientCareProvisionEvent>
  </PDSResponse>`;

describe('app', () => {
  describe('GET /health', () => {
    beforeEach(() => {
      getHealthCheck.mockReturnValue(
        Promise.resolve({
          details: {
            filestore: {
              available: true,
              writable: true
            },
            mhs: {
              connected: true
            }
          }
        })
      );
    });

    it('should return a 200 status code', done => {
      request(app)
        .get('/health')
        .expect(200)
        .end(done);
    });
  });

  describe('POST /ehr-request', () => {
    const validRequestBody = { nhsNumber: 'some-nhs-number', odsCode: 'some-odsCode' };

    beforeEach(() => {
      sendEhrRequest.mockResolvedValue();
    });

    it('should return a 202 status code', done => {
      request(app)
        .post('/ehr-request')
        .send(validRequestBody)
        .expect(202)
        .end(done);
    });
  });

  describe('GET /patient-demographics/:nhsNumber', () => {
    beforeEach(() => {
      config.pdsAsid = 'pdsAsid';
      config.deductionsAsid = 'deductionsAsid';

      uuid.mockImplementation(() => mockUUID);

      process.env.AUTHORIZATION_KEYS = 'correct-key';

      when(sendMessage)
        .calledWith({ interactionId, conversationId: mockUUID.toUpperCase(), message: fakerequest })
        .mockResolvedValue({ status: 200, data: message });

      generatePdsRetrievalQuery.mockResolvedValue(fakerequest);
    });

    it('should return a 200', done => {
      request(app)
        .get('/patient-demographics/9999999999')
        .expect(200)
        .end(done);
    });

    it('should return on object containing serialChangeNumber and patientPdsId', done => {
      request(app)
        .get('/patient-demographics/9999999999')
        .expect(200)
        .expect(res =>
          expect(res.body.data).toEqual({
            serialChangeNumber: testSerialChangeNumber,
            patientPdsId: testPatientPdsId
          })
        )
        .end(done);
    });
  });

  describe('POST /patient-demographics/:nhsNumber', () => {
    beforeEach(() => {
      config.pdsAsid = 'pdsAsid';
      config.deductionsAsid = 'deductionsAsid';
      uuid.mockImplementation(() => mockUUID);

      process.env.AUTHORIZATION_KEYS = 'correct-key';

      when(sendMessage)
        .calledWith({
          interactionId: interactionIdUpdate,
          conversationId: mockUUID.toUpperCase(),
          message: fakerequestUpdate
        })
        .mockResolvedValue({ status: 202, data: {} });

      generateUpdateOdsRequest.mockResolvedValue(fakerequestUpdate);
    });

    it('should return a 204 (no content) if :nhsNumber is numeric and 10 digits and Authorization Header provided', done => {
      request(app)
        .patch('/patient-demographics/9442964410')
        .send({
          serialChangeNumber: '123',
          pdsId: 'cppz'
        })
        .expect(204)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });

  describe('POST /health-record-requests/:nhsNumber', () => {
    it('should return a 204 status code', done => {
      request(app)
        .post('/health-record-requests/1234567890')
        .send({
          repositoryOdsCode: 'repo_ods_code',
          repositoryAsid: 'repo_asid',
          practiceOdsCode: 'practice_ods_code',
          practiceAsid: 'practice_asid'
        })
        .expect(204)
        .end(done);
    });
  });
});
