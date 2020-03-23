import { updateLogEventWithError } from '../../middleware/logging';
import MhsError from '../../services/mhs/mhs-error';
import sendEhrRequest from './send-ehr-request';

export const postEhrRequest = (req, res, next) => {
  sendEhrRequest(req.body.nhsNumber, req.body.odsCode)
    .then(() => res.sendStatus(202))
    .catch(err => {
      updateLogEventWithError(err);

      if (err instanceof MhsError) {
        return res.status(503).json({ error: err.message });
      }

      next(err);
    });
};
