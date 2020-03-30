import app from './app';
import logger from './config/logging';
import { initialiseSubscriber } from './services/queue/subscriber';

initialiseSubscriber();

app.listen(3000, () => logger.info('Listening on port 3000'));
