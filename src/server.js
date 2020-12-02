import app from './app';
import { initialiseSubscriber } from './services/queue/subscriber';
import { logEvent } from './middleware/logging';

initialiseSubscriber();

app.listen(3000, () => logEvent('Listening on port 3000'));
