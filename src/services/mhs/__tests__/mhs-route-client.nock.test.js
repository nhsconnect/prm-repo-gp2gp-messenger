import nock from 'nock';
import { initialiseConfig } from '../../../config';
import { getPracticeAsid } from '../mhs-route-client';

jest.mock('../../../config');

describe('mhs-route-client', () => {
  const host = 'http://localhost';
  const odsCode = 'A123456';
  const expectedAsid = '12345678900';
  const serviceId = 'urn:nhs:names:services:gp2gp:RCMR_IN010000UK05';

  it('should make request to MHS route URL with the query string', async () => {
    initialiseConfig.mockReturnValue({ mhsRouteUrl: host });
    nock(host)
      .get(`/routing?org-code=A123456&service-id=${serviceId}`)
      .reply(200, { uniqueIdentifier: [expectedAsid] });

    expect(await getPracticeAsid(odsCode, serviceId)).toBe(expectedAsid);
  });

  it('should trim / from base url of MHS', async () => {
    initialiseConfig.mockReturnValue({ mhsRouteUrl: `${host}/` });
    nock(host)
      .get(`/routing?org-code=A123456&service-id=${serviceId}`)
      .reply(200, { uniqueIdentifier: [expectedAsid] });

    expect(await getPracticeAsid(odsCode, serviceId)).toBe(expectedAsid);
  });
});
