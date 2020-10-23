import axios from 'axios';
import config from '../../../config';
import { sendPdsUpdate } from '../';
import { eventFinished } from '../../../middleware/logging';

jest.mock('axios');
jest.mock('../../../middleware/logging', () => ({
  updateLogEvent: jest.fn(),
  eventFinished: jest.fn()
}));

const originalGpToRepoUrl = config.originalGpToRepoUrl;
const conversationId = '31079679-ef31-4d97-af0d-d1fda73cd8a5';

describe('sendPdsUpdate', () => {
  beforeEach(() => {
    config.gpToRepoUrl = 'https://gp-to-repo-url';
    axios.patch.mockResolvedValue({ status: 204 });
  });

  afterEach(() => {
    config.gpToRepoUrl = originalGpToRepoUrl;
  });

  it('should make a PATCH request to GPToRepo with conversation ID', async done => {
    await sendPdsUpdate(conversationId);
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      `${config.gpToRepoUrl}/deduction-requests/${conversationId}/pds-update`
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
