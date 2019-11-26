import httpContext from 'express-http-context';
import uuid from 'uuid/v4';

export const getCorrelationId = () => httpContext.get('correlationId');

export const addCorrelationInfo = (req, res, next) => {
  httpContext.set('correlationId', uuid());
  next();
};
