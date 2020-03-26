import { updateLogEvent } from '../../middleware/logging';
import { checkMHSHealth } from './check-mhs-health';

export function getHealthCheck() {
  updateLogEvent({ status: 'Starting health check' });

  return Promise.all([checkMHSHealth()]).then(([mhs]) => {
    updateLogEvent({ mhs });
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
