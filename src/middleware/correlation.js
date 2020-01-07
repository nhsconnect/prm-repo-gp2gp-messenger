import httpContext from 'async-local-storage';
import uuid from 'uuid/v4';
import axios from 'axios';

const CORRELATION_ID_HEADER = 'X-Correlation-ID';
const CORRELATION_ID_KEY = 'correlationId';

export const getCorrelationId = () => httpContext.get(CORRELATION_ID_KEY);
export const setCorrelationInfo = (correlationId = uuid()) =>
  httpContext.set(CORRELATION_ID_KEY, correlationId);

export const middleware = (req, res, next) => {
  setCorrelationInfo(req.get(CORRELATION_ID_HEADER));
  axios.defaults.headers.common[CORRELATION_ID_HEADER] = getCorrelationId();
  next();
};
