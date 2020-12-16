import httpContext from 'async-local-storage';
import { logEvent } from '../../../middleware/logging';
import { mockChannel } from '../../../__mocks__/stompit';
import { extractInteractionId } from '../../parser/message';
import { channelPool, sendToQueue } from '../../queue';
import { getRoutingInformation, sendMessage } from '../mhs-old-queue-test-helper';

httpContext.enable();

jest.mock('../../../config/logging');
jest.mock('../../../config/', () => ({
  initializeConfig: jest.fn().mockReturnValue({
    queueUrls: ['tcp://mq-1:61613', 'tcp://mq-2:61613'],
    queueName: 'test-queue'
  })
}));
jest.mock('../../../middleware/logging');
jest.mock('../../parser/message');
jest.mock('../../queue');

describe('mhs-gateway-fake', () => {
  describe('sendMessage', () => {
    afterEach(() => {
      channelPool.channel.mockImplementation(callback => callback(false, mockChannel));
    });

    it('should reject when an error has occurred', () => {
      const error = new Error('some-error');

      channelPool.channel.mockImplementation(callback => callback(error));

      expect(sendMessage('message')).rejects.toStrictEqual(error);
    });

    it('should update log event when an error has occurred', async () => {
      const error = new Error('some-error');

      channelPool.channel.mockImplementation(callback => callback(error));

      await sendMessage('message').catch(() => {});

      expect(channelPool.channel).toHaveBeenCalledTimes(1);
      expect(logEvent).toHaveBeenCalledWith('mhs-connection-failed');
    });

    it('should put response on queue once when ehr request sent', async done => {
      const requestEhrRequest = 'RCMR_IN010000UK05';

      extractInteractionId.mockReturnValue(requestEhrRequest);

      await sendMessage('message');
      expect(logEvent).toHaveBeenCalledWith('sendMessage call', {
        mhs: { interactionId: requestEhrRequest }
      });
      expect(sendToQueue).toHaveBeenCalledTimes(1);
      expect(sendToQueue).toHaveBeenCalledWith(expect.any(String));
      done();
    });

    it('should not put fragment on queue if message is not RCMR_IN010000UK05', async done => {
      const interactionId = 'FAKE_IN010000UK05';
      extractInteractionId.mockReturnValue(interactionId);
      await sendMessage('<FAKE_IN010000UK05></FAKE_IN010000UK05>');
      expect(logEvent).toHaveBeenCalledWith('sendMessage call', {
        mhs: { interactionId }
      });
      expect(sendToQueue).toHaveBeenCalledTimes(0);
      done();
    });
  });

  describe('getRoutingInformation', () => {
    it('should return the ods code with aisd prefixed', () => {
      const testOdsCode = 'test-ods';

      const expectedResult = {
        asid: 'asid-' + testOdsCode
      };

      return expect(getRoutingInformation(testOdsCode)).resolves.toStrictEqual(expectedResult);
    });
  });
});
