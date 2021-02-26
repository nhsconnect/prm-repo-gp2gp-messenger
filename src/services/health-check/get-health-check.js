import { logInfo } from '../../middleware/logging';

export function getHealthCheck() {
  logInfo('Starting health check');

  return Promise.resolve().then(() => {
    return {
      version: '1',
      description: 'Health of GP2GP Adapter service',
      node_env: process.env.NODE_ENV,
      details: {}
    };
  });
}
