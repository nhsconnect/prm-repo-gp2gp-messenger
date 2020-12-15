import app from './app';
import { initialiseSubscriber } from './services/queue/subscriber';
import { initialiseConfig } from './config';
import { logEvent } from './middleware/logging';

const config = initialiseConfig();
const gp2gpWorker = config.enableWorker;
const gp2gpServer = config.enableServer;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(2000);
  }
}

if (gp2gpWorker === 'true') {
  initialiseSubscriber();
}

if (gp2gpServer === 'true') {
  app.listen(3000, () => logEvent('Listening on port 3000'));
} else {
  wait();
}
