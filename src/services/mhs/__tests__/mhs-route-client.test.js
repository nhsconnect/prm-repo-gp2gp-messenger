import axios from 'axios';
import { initializeConfig } from '../../../config';
import { getPracticeAsid } from '../mhs-route-client';

jest.mock('../../../config');
jest.mock('axios');

describe('mhs-route-client', () => {
  const odsCode = 'A123456';
  const expectedAsid = '12345678900';
  const serviceId = 'urn:nhs:names:services:gp2gp:RCMR_IN010000UK05';
  initializeConfig.mockReturnValue({ mhsRouteUrl: 'local-mhs-route-url' });

  it('should return an ASID given practice ODS code', async () => {
    axios.get.mockResolvedValue({ status: 200, data: { uniqueIdentifier: [expectedAsid] } });

    expect(await getPracticeAsid(odsCode, serviceId)).toBe(expectedAsid);
  });

  it('should call mhs with url provided in the config', async () => {
    axios.get.mockResolvedValue({ status: 200, data: { uniqueIdentifier: [expectedAsid] } });
    await getPracticeAsid(odsCode, serviceId);

    expect(axios.get).toHaveBeenCalledWith('local-mhs-route-url/routing', expect.anything());
  });

  it('should call mhs with correct interaction id', async () => {
    axios.get.mockResolvedValue({ status: 200, data: { uniqueIdentifier: [expectedAsid] } });
    await getPracticeAsid(odsCode, serviceId);

    expect(axios.get).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ params: expect.objectContaining({ 'service-id': serviceId }) })
    );
  });

  it('should call mhs with provided ods code', async () => {
    axios.get.mockResolvedValue({ status: 200, data: { uniqueIdentifier: [expectedAsid] } });
    await getPracticeAsid(odsCode, serviceId);

    expect(axios.get).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ params: expect.objectContaining({ 'org-code': odsCode }) })
    );
  });

  it("should throw if the call to MHS doesn't return 200", async () => {
    axios.get.mockResolvedValue({ status: 500 });

    await expect(getPracticeAsid(odsCode, serviceId)).rejects.toThrow(
      new Error('MHS failed to provide ASID for ODS code A123456')
    );
  });

  it('should throw if no ASID is found for a given practice ODS code', async () => {
    axios.get.mockResolvedValue({ status: 200, data: { uniqueIdentifier: [] } });

    await expect(getPracticeAsid(odsCode, serviceId)).rejects.toThrow(
      new Error('No ASID found for ODS code A123456')
    );
  });

  it('should throw if multiple ASIDs are found for a given practice ODS code', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: { uniqueIdentifier: ['12345678900', '12345678901'] }
    });

    await expect(getPracticeAsid(odsCode, serviceId)).rejects.toThrow(
      new Error('Multiple ASIDs found for ODS code A123456')
    );
  });
});
