import httpContext from 'async-local-storage';
import merge from 'lodash.merge';
import logger from '../config/logging';
import { setCorrelationInfo } from './correlation';

const LOG_EVENT_KEY = 'logEvent';

export const updateLogEvent = event =>
  httpContext.set(LOG_EVENT_KEY, merge(httpContext.get(LOG_EVENT_KEY), event));

export const updateLogEventWithError = err =>
  updateLogEvent({ error: { ...err, message: err.message, stack: err.stack } });

export const middleware = (req, res, next) => {
  httpContext.scope();
  httpContext.set(LOG_EVENT_KEY, { status: 'unknown' });
  res.on('finish', eventFinished);
  next();
};

export const withContext = fn => {
  httpContext.scope();
  httpContext.set(LOG_EVENT_KEY, { status: 'unknown' });
  setCorrelationInfo();
  fn();
};

export const eventFinished = () => {
  logger.info('Event finished', { event: httpContext.get(LOG_EVENT_KEY) });
};
