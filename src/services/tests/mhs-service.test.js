import axios from 'axios';
import { when } from 'jest-when';
import uuid from 'uuid/v4';
import { updateLogEventWithError } from '../../middleware/logging';
import { sendMessage } from '../mhs-service';

jest.mock('../../config/logging');
jest.mock('../../middleware/logging');

jest.mock('axios');

describe('mhs-service', () => {
  const interactionId = 'QUPA_IN000008UK02';
  const conversationId = uuid();
  const odsCode = 'A123';
  const requestOptions = {
    method: 'POST',
    url:
      'https://gpitbjss.atlassian.net/wiki/spaces/TW/pages/1802240048/MHS+Adapter+GP2GP+Compliance',
    headers: {
      'Content-Type': 'application/json',
      'Interaction-ID': interactionId,
      'Sync-Async': false,
      'Correlation-Id:': conversationId,
      'Ods-Code': odsCode
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();

    when(axios)
      .calledWith(requestOptions)
      .mockResolvedValue({ status: 200 })
      .calledWith({
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'Ods-Code': 'YES'
        }
      })
      .mockResolvedValue({ status: 200 });
  });

  it('logs an Error if interactionId is not passed in', () => {
    return sendMessage({ conversationId }).catch(err => {
      const error = Error(['interactionId must be passed in']);
      expect(err).toEqual(error);
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(error);
    });
  });

  it('logs an Error if conversationId is not passed in', () => {
    const error = Error(['conversationId must be passed in']);
    return sendMessage({ interactionId }).catch(err => {
      expect(err).toEqual(error);
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(error);
    });
  });

  it('logs an Error if conversationId and interactionId is not passed in', () => {
    return sendMessage().catch(err => {
      expect(err.message).toContain('conversationId must be passed in');
      expect(err.message).toContain('interactionId must be passed in');
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('throws an Error if interactionId is not passed in', () => {
    expect(sendMessage({ conversationId })).rejects.toThrowError(
      Error('interactionId must be passed in')
    );
  });

  it("should call axios with odsCode 'YES' by default and return 200", () => {
    return sendMessage({ interactionId, conversationId }).then(response => {
      expect(response.status).toBe(200);
      expect(axios).toBeCalledWith({
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'Ods-Code': 'YES'
        }
      });
    });
  });
});
