import { when } from 'jest-when';
import request from 'supertest';
import uuid from 'uuid/v4';
import app from '../app';
import config from '../config';
import sendEhrRequest from '../services/ehr-request';
import generatePdsRetrievalQuery from '../templates/generate-pds-retrieval-request';
import generateUpdateOdsRequest from '../templates/generate-update-ods-request';
import { getHealthCheck } from '../services/get-health-check';
import { validatePdsResponse } from '../services/pds/pds-response-validator';
import { parsePdsResponse } from '../services/pds/pds-response-handler';
import { sendMessage } from '../services/mhs/mhs-outbound-client';

jest.mock('../services/ehr-request');
jest.mock('../config/logging');
jest.mock('../services/get-health-check');
jest.mock('../middleware/auth');
jest.mock('../services/pds/pds-response-validator');
jest.mock('../services/pds/pds-response-handler');
jest.mock('../services/mhs/mhs-outbound-client');
jest.mock('../templates/generate-pds-retrieval-request');
jest.mock('../templates/generate-update-ods-request');
jest.mock('uuid/v4');

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

  describe('GET /pds-retrieval/:nhsNumber', () => {
    beforeEach(() => {
      config.pdsAsid = 'pdsAsid';
      config.deductionsAsid = 'deductionsAsid';

      uuid.mockImplementation(() => mockUUID);

      process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';

      validatePdsResponse.mockResolvedValue(Promise.resolve(true));
      parsePdsResponse.mockResolvedValue({
        serialChangeNumber: testSerialChangeNumber,
        patientPdsId: testPatientPdsId
      });

      when(sendMessage)
        .calledWith({ interactionId, conversationId: mockUUID.toUpperCase(), message: fakerequest })
        .mockResolvedValue({ status: 200, data: message });

      generatePdsRetrievalQuery.mockResolvedValue(fakerequest);
    });

    it('should return a 200 and parse the pds response if the response is valid', done => {
      request(app)
        .get('/pds-retrieval/9999999999')
        .expect(200)
        .expect(async () => {
          await parsePdsResponse(message).then(result =>
            expect(result).toEqual({
              serialChangeNumber: testSerialChangeNumber,
              patientPdsId: testPatientPdsId
            })
          );
        })
        .end(done);
    });
  });

  describe('POST /pds-update/:serialChangeNumber/:pdsId/:nhsNumber', () => {
    beforeEach(() => {
      config.pdsAsid = 'pdsAsid';
      config.deductionsAsid = 'deductionsAsid';
      uuid.mockImplementation(() => mockUUID);

      process.env.AUTHORIZATION_KEYS = 'correct-key,other-key';

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
        .post('/pds-update/123/cppz/9442964410')
        .expect(204)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });
});
