import httpContext from 'async-local-storage';
import express from 'express';
import { errorLogger, logger as requestLogger } from 'express-winston';
import swaggerUi from 'swagger-ui-express';
import { ehrRequest } from './api/ehr-request';
import error from './api/error';
import healthCheck from './api/health';
import { healthRecordRequestRouter } from './api/health-record-requests';
import { patientDemographics } from './api/patient-demographics';
import { options } from './config/logging';
import * as correlationInfo from './middleware/correlation';
import * as logging from './middleware/logging';
import swaggerDocument from './swagger.json';

httpContext.enable();

const app = express();

app.use(express.json());
app.use(correlationInfo.middleware);
app.use(requestLogger(options));

app.use('/health', logging.middleware, healthCheck);
app.use('/ehr-request', logging.middleware, ehrRequest);
app.use('/error', logging.middleware, error);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/patient-demographics', logging.middleware, patientDemographics);
app.use('/health-record-requests', logging.middleware, healthRecordRequestRouter);

app.use(errorLogger(options));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

export default app;
