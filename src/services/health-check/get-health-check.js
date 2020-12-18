import { logEvent } from '../../middleware/logging';

export function getHealthCheck() {
  logEvent('Starting health check');

  return Promise.resolve().then(() => {
    return {
      version: '1',
      description: 'Health of GP2GP Adapter service',
      node_env: process.env.NODE_ENV,
      details: {}
    };
  });
}
