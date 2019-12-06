import httpContext from 'express-http-context';
import merge from 'lodash.merge';
import logger from '../config/logging';

const LOG_EVENT_KEY = 'logEvent';

export const updateLogEvent = event =>
  httpContext.set(LOG_EVENT_KEY, merge(httpContext.get(LOG_EVENT_KEY), event));

export const sendLogEventOnResponse = (req, res, next) => {
  httpContext.set(LOG_EVENT_KEY, {
    status: 'unknown'
  });

  res.on('finish', () => {
    logger.info('Event finished', { event: httpContext.get(LOG_EVENT_KEY) });
  });

  next();
};
