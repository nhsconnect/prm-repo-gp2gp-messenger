export const putMessageOnQueue = (client, message, options) => {
  const transaction = client.begin();
  const stream = transaction.send(options);
  stream.write(message);
  stream.end();
  transaction.commit();
};
