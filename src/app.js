import express from 'express';
import { errorLogger, logger as requestLogger } from 'express-winston';
import httpContext from 'express-http-context';
import { options } from './config/logging';
import { addCorrelationInfo } from './middleware/correlation';
import ehrRequest from './api/ehr-request';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

const app = express();

app.use(httpContext.middleware);
app.use(addCorrelationInfo);
app.use(requestLogger(options));

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.use('/ehr-request', ehrRequest);

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorLogger(options));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

export default app;
