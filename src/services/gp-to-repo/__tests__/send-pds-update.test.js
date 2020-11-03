import axios from 'axios';
import config from '../../../config';
import { sendPdsUpdate } from '../';
import { eventFinished } from '../../../middleware/logging';

jest.mock('axios');
jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn(),
  eventFinished: jest.fn()
}));

const conversationId = '31079679-ef31-4d97-af0d-d1fda73cd8a5';
const originalGpToRepoAuthKeys = config.gpToRepoAuthKeys;
const originalGpToRepoUrl = config.gpToRepoUrl;

describe('sendPdsUpdate', () => {
  beforeEach(() => {
    axios.patch.mockResolvedValue({ status: 204 });
    config.gpToRepoAuthKeys = 'fake-keys';
    config.gpToRepoUrl = 'fake-url';
  });

  afterEach(() => {
    config.gpToRepoAuthKeys = originalGpToRepoAuthKeys;
    config.gpToRepoUrl = originalGpToRepoUrl;
  });

  it('should make a PATCH request to GPToRepo with conversation ID', async done => {
    const axiosHeaders = { headers: { Authorization: `${config.gpToRepoAuthKeys}` } };
    await sendPdsUpdate(conversationId);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${config.gpToRepoUrl}/deduction-requests/${conversationId}/pds-update`,
      {},
      axiosHeaders
    );
    done();
  });

  it('should call eventFinished', async done => {
    await sendPdsUpdate(conversationId);
    expect(eventFinished).toHaveBeenCalledTimes(1);
    done();
  });

  it('should throw an error if axios.patch throws', () => {
    axios.patch.mockImplementation(() => {
      throw new Error('some-error');
    });
    return expect(sendPdsUpdate(conversationId)).rejects.toEqual(Error('some-error'));
  });
});
