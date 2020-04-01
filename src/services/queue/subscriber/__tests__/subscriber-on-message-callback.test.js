import {
  eventFinished,
  updateLogEvent,
  updateLogEventWithError
} from '../../../../middleware/logging';
import { mockClient } from '../../../../__mocks__/stompit';
import { handleMessage } from '../message-handler';
import { subscriberOnMessageCallback } from '../subscriber-on-message-callback';

jest.mock('../message-handler');
jest.mock('../../../../middleware/logging');

const mockMessage = 'mock-message';
const mockBody = 'mock-body';
const mockError = 'mock-error';
const callback = subscriberOnMessageCallback(mockClient, mockMessage);

describe('subscriberOnMessageCallback', () => {
  describe('on success', () => {
    beforeEach(async () => {
      handleMessage.mockResolvedValue();
      await callback(false, mockBody);
    });

    it('should call updateLogEvent status on success with "Handling Message"', () => {
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Handling Message'
        })
      );
    });

    it('should call client.ack with message on success', () => {
      expect(mockClient.ack).toHaveBeenCalledTimes(1);
      expect(mockClient.ack).toHaveBeenCalledWith(mockMessage);
    });

    it('should call eventFinished on success', () => {
      expect(eventFinished).toHaveBeenCalledTimes(1);
    });
  });

  describe('if error in callback', () => {
    beforeEach(async () => {
      handleMessage.mockResolvedValue();
      await callback(mockError);
    });

    it('should call updateLogEvent status on error with "Handling Message"', () => {
      expect(updateLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Handling Message'
        })
      );
    });

    it('should call updateLogEventWithError with the error', () => {
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(mockError);
    });

    it('should call eventFinished after the updateLogEventWithError error', () => {
      expect(eventFinished).toHaveBeenCalledTimes(1);
    });

    it('should return from callback', async () => {
      expect(handleMessage).toHaveBeenCalledTimes(0);
    });
  });

  describe('handleMessage throws error', () => {
    beforeEach(async () => {
      handleMessage.mockRejectedValue(mockError);
      await callback(false, mockBody);
    });

    it('should call updateLogEventWithError with the error', () => {
      expect(updateLogEventWithError).toHaveBeenCalledTimes(1);
      expect(updateLogEventWithError).toHaveBeenCalledWith(mockError);
    });

    it('should call client.ack with message on failure', () => {
      expect(mockClient.ack).toHaveBeenCalledTimes(1);
      expect(mockClient.ack).toHaveBeenCalledWith(mockMessage);
    });

    it('should call eventFinished after the updateLogEventWithError error', () => {
      expect(eventFinished).toHaveBeenCalledTimes(1);
    });
  });
});
