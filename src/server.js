import app from './app';
import { initialiseSubscriber } from './services/queue/subscriber';
import { initializeConfig } from './config';
import { logEvent } from './middleware/logging';

const config = initializeConfig();
const gp2gpWorker = config.enableWorker;
const gp2gpServer = config.enableServer;

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const wait = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(2000);
  }
};

if (gp2gpWorker === 'true') {
  initialiseSubscriber();
}

if (gp2gpServer === 'true') {
  app.listen(3000, () => logEvent('Listening on port 3000'));
} else {
  wait();
}
