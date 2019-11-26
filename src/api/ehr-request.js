import express from 'express';
import { checkIsAuthenticated } from '../middleware/auth';

const router = express.Router();

router.post('/', checkIsAuthenticated, (req, res) => {
  res.sendStatus(202);
});

export default router;
