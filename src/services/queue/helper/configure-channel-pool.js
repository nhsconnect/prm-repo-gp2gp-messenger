import { ChannelPool } from 'stompit';
import { getQueueConnections } from './get-queue-connections';

export const configureChannelPool = () => {
  return new ChannelPool(getQueueConnections(), {
    minChannels: 0,
    minFreeChannels: 0,
    maxChannels: Infinity,
    freeExcessTimeout: null
  });
};

export default configureChannelPool();
