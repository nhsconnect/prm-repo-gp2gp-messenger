import { ConnectFailover } from 'stompit';
import { getStompitQueueConfig } from '../../../config/utils';
import { updateLogEvent, updateLogEventWithError } from '../../../middleware/logging';

export const getQueueConnections = () => {
  const connections = new ConnectFailover(getStompitQueueConfig(), {
    maxReconnects: 1,
    initialReconnectDelay: 100
  });

  connections.on('connecting', connector => {
    updateLogEvent({
      status: 'Connecting to Queue',
      queue: {
        transportPath: connector.serverProperties.remoteAddress.transportPath
      }
    });
  });

  connections.on('error', err => {
    updateLogEventWithError(new Error(`Connection.onError: ${err.message}`));
  });

  return connections;
};
