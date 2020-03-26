import { ConnectFailover } from 'stompit';
import logger from '../../../config/logging';
import { getStompitQueueConfig } from '../../../config/utils';

export const connectToQueue = callback => {
  const queue = new ConnectFailover(getStompitQueueConfig(), {
    maxReconnects: 1,
    initialReconnectDelay: 100
  });
  queue.on('error', error => {
    logger.error(`Failover url could not connect to the queue broker: ${error}`, error);
  });
  return queue.connect(callback);
};
