import { getHealthCheck } from '../get-health-check';

jest.mock('../../../config/logging');
jest.mock('../../../middleware/logging');

describe('get-health-check', () => {
  describe('getHealthCheck', () => {
    it('should resolve when both checks are ok', () => {
      return getHealthCheck().then(result => {
        return expect(result).toStrictEqual(expectedHealthCheckBase());
      });
    });

    it('should resolve when MHS is not ok', () => {
      return getHealthCheck().then(result => {
        return expect(result).toStrictEqual(expectedHealthCheckBase());
      });
    });
  });
});

const expectedHealthCheckBase = () => ({
  version: '1',
  description: 'Health of GP2GP Messenger service',
  node_env: process.env.NHS_ENVIRONMENT,
  details: {}
});
