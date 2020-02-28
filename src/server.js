import app from './app';
import logger from './config/logging';
import initialiseConsumer from './services/consumer';

initialiseConsumer();

const portNumber = 3000;
app.listen(3000, () => logger.info('Listening on port 3000'));

export { portNumber };
