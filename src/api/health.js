import express from 'express';
import { logEvent, logError } from '../middleware/logging';
import { getHealthCheck } from '../services/health-check/get-health-check';

const router = express.Router();

router.get('/', (req, res, next) => {
  getHealthCheck()
    .then(status => {
      if (status.details.mhs.connected) {
        logEvent('Health check successful');
        res.status(200).send(status);
      } else {
        logEvent('Health check failed', status);
        res.status(503).send(status);
      }
    })
    .catch(err => {
      logError('Health check error', err);
      next(err);
    });
});

export default router;
