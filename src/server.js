import app from './app';
import logger from './config/logging';

app.listen(3000, () => logger.info('Listening on port 3000'));
