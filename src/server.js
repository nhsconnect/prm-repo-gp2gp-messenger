import app from './app';
import logger from './config/logging';
import { initialiseConsumer } from './services/queue/consumer';

initialiseConsumer();

app.listen(3000, () => logger.info('Listening on port 3000'));
