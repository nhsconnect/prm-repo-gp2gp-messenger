import express from 'express';

const router = express.Router();

router.get('/:nhsNumber', (req, res, next) => {
  res.sendStatus(200);
  next();
});

export default router;
