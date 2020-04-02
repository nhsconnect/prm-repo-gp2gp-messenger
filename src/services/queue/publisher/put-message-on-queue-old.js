import { updateLogEvent } from '../../../middleware/logging';

export const putMessageOnQueueOld = (client, message, options) => {
  updateLogEvent({
    status: 'Putting Message on queue',
    queue: {
      options
    }
  });
  const transaction = client.begin();

  updateLogEvent({ status: 'Sending transaction', queue: { transaction: { id: transaction.id } } });

  const stream = transaction.send(options);
  stream.write(message);
  stream.end();
  transaction.commit();
};
