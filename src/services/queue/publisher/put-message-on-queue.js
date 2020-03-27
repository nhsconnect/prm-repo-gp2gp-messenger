import config from '../../../config';

export const putMessageOnQueue = (client, message, options = { destination: config.queueName }) => {
  const transaction = client.begin();
  const stream = transaction.send(options);
  stream.write(message);
  stream.end();
  transaction.commit();
};
