import { getQueueConnections } from './get-queue-connections';

export const connectToQueue = callback => {
  return getQueueConnections().connect(callback);
};
