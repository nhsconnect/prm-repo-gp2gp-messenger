import express from 'express';
import { errorLogger, logger as requestLogger } from 'express-winston';
import httpContext from 'async-local-storage';
import { options } from './config/logging';
import * as correlationInfo from './middleware/correlation';
import * as logging from './middleware/logging';
import ehrRequest from './api/ehr-request';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

httpContext.enable();

const app = express();

app.use(express.json());
app.use(correlationInfo.middleware);
app.use(requestLogger(options));

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.use('/ehr-request', logging.middleware, ehrRequest);

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorLogger(options));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

export default app;
