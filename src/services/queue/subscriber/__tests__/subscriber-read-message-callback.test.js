import { mockClient, mockMessageStream } from '../../../../__mocks__/stompit';
import { subscriberReadMessageCallback } from '../subscriber-read-message-callback';
import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError
} from '../../../../middleware/logging';

jest.mock('async-local-storage');
jest.mock('../../../../middleware/logging');
jest.mock('../subscriber-on-message-callback');

const mockError = 'mock-error';
const mockCallback = subscriberReadMessageCallback(mockClient);

describe('subscriberReadMessageCallback', () => {
  describe('on success', () => {
    beforeEach(async () => {
      await mockCallback(false, mockMessageStream);
    });

    it('should call updateLogEvent', () => {
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Subscriber has Received Message'
        })
      );
    });

    it('should set the readString with callback', () => {
      expect(mockMessageStream.readString).toHaveBeenCalledTimes(1);
      expect(mockMessageStream.readString).toHaveBeenCalledWith('UTF-8', expect.any(Function));
    });
  });

  describe('on error', () => {
    beforeEach(async () => {
      await mockCallback(mockError, mockMessageStream);
    });

    it('should call updateLogEvent', () => {
      expect(updateLogEvent).toHaveBeenCalledTimes(1);
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Subscriber has Received Message'
        })
      );
    });

    it('should call updateLogEventWithError with the error', () => {
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(mockError);
    });

    it('should call eventFinished', () => {
      expect(eventFinished).toHaveBeenCalledTimes(1);
    });
  });
});
