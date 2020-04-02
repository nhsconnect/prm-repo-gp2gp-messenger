import httpContext from 'async-local-storage';
import config from '../../../config';
import { updateLogEvent } from '../../../middleware/logging';
import { mockChannel } from '../../../__mocks__/stompit';
import { extractInteractionId } from '../../parser/message';
import { channelPool, sendToQueue } from '../../queue';
import { getRoutingInformation, sendMessage } from '../mhs-old-queue-test-helper';

httpContext.enable();

jest.mock('../../queue');

jest.mock('../../../config/logging');
jest.mock('../../../middleware/logging');
jest.mock('../../parser/message');

const mockQueueName = 'test-queue';

const originalConfig = config;

describe('mhs-gateway-fake', () => {
  describe('sendMessage', () => {
    beforeEach(() => {
      config.queueName = mockQueueName;
    });

    afterEach(() => {
      channelPool.channel.mockImplementation(callback => callback(false, mockChannel));
      config.queueName = originalConfig.queueName;
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
      expect(updateLogEvent).toHaveBeenCalledWith({
        mhs: { status: 'connection-failed' }
      });
    });

    it('should put response on queue once when ehr request sent', async done => {
      const requestEhrRequest = 'RCMR_IN010000UK05';

      extractInteractionId.mockReturnValue(requestEhrRequest);

      await sendMessage('message');
      expect(updateLogEvent).toHaveBeenCalledWith({
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
      expect(updateLogEvent).toHaveBeenCalledWith({
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
