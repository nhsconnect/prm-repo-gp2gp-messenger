import axios from 'axios';
import { initialiseConfig } from '../../../config';
import { updateLogEventWithError } from '../../../middleware/logging';
import { setTransferComplete } from '../set-ehr-repo-transfer-complete';

jest.mock('axios');
jest.mock('../../../config');
jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn(),
  updateLogEventWithError: jest.fn(),
  eventFinished: jest.fn()
}));

describe('setTransferComplete', () => {
  const body = 'some-request-body';
  const mockEhrRepoUrl = 'https://ehr-repo-url';
  const mockAuthKeys = 'auth';
  initialiseConfig.mockReturnValue({ ehrRepoUrl: mockEhrRepoUrl, ehrRepoAuthKeys: mockAuthKeys });
  const axiosConfig = { headers: { Authorization: mockAuthKeys } };

  beforeEach(() => {
    axios.patch.mockResolvedValue({ data: 'some-url' });
  });

  it('should make a call to ehr storage endpoint with conversation ID and message', async done => {
    await setTransferComplete(body);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${mockEhrRepoUrl}/fragments`,
      expect.objectContaining({
        body,
        transferComplete: true
      }),
      axiosConfig
    );
    done();
  });

  it('should throw an error if axios.patch throws', () => {
    axios.patch.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(setTransferComplete(body)).rejects.toEqual(Error('some-error'));
  });

  it('should call updateLogEvent with the error if axios.patch throws', async done => {
    axios.patch.mockImplementation(() => {
      throw new Error('some-error');
    });
    await setTransferComplete(body).catch(() => {});
    expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
    expect(updateLogEventWithError).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed to update transfer complete to ehr repo api',
        error: expect.anything()
      })
    );
    done();
  });
});
