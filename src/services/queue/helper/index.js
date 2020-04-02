import { configureChannelPool } from './configure-channel-pool';

export { clearQueue } from './clear-queue';
export { connectToQueue } from './connect-to-queue';
export { consumeOneMessage } from './consume-one-message';

const channelPool = configureChannelPool();
export { channelPool };
