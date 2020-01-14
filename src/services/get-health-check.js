import { updateLogEvent } from '../middleware/logging';
import S3Service from '../storage/s3';
import { checkMHSHealth } from '../config/queue';

export function getHealthCheck() {
  updateLogEvent({ status: 'Starting health check' });

  const s3Service = new S3Service('health', 'health-check.txt');

  return Promise.all([s3Service.checkS3Health(), checkMHSHealth()]).then(([s3, mhs]) => {
    updateLogEvent({ mhs, s3 });
    return {
      version: '1',
      description: 'Health of GP2GP Adapter service',
      node_env: process.env.NODE_ENV,
      details: {
        filestore: s3,
        mhs: mhs
      }
    };
  });
}
