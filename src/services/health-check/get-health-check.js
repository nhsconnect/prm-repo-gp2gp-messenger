import { logEvent } from '../../middleware/logging';
import { checkMHSHealth } from './check-mhs-health';

export function getHealthCheck() {
  logEvent('Starting health check');

  return Promise.all([checkMHSHealth()]).then(([mhs]) => {
    logEvent('MHS health check', { mhs });
    return {
      version: '1',
      description: 'Health of GP2GP Adapter service',
      node_env: process.env.NODE_ENV,
      details: {
        mhs: mhs
      }
    };
  });
}
