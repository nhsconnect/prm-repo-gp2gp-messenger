import axios from 'axios';
import config from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { setTransferComplete } from '../set-ehr-repo-transfer-complete';

jest.mock('axios');
jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn(),
  eventFinished: jest.fn()
}));

const originalEhrRepoUrl = config.ehrRepoUrl;

describe('setTransferComplete', () => {
  const body = 'some-request-body';

  beforeEach(() => {
    config.ehrRepoUrl = 'https://ehr-repo-url';
    axios.patch.mockResolvedValue({ data: 'some-url' });
  });

  afterEach(() => {
    config.ehrRepoUrl = originalEhrRepoUrl;
  });

  it('should make a call to ehr storage endpoint with conversation ID and message', async done => {
    await setTransferComplete(body);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${config.ehrRepoUrl}/fragments`,
      expect.objectContaining({
        body,
        transferComplete: true
      })
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
    expect(updateLogEvent).toHaveBeenCalledTimes(1);
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed to update transfer complete to ehr repo api',
        error: expect.anything()
      })
    );
    done();
  });
});
