import { connectToQueue } from '../../../src/config/queue';
import config from '../../config';

const putMessageOnQueue = (client, message) => {
  const transaction = client.begin();
  const frame = transaction.send({ destination: config.queueName });
  frame.write(message);
  frame.end();
  transaction.commit();
};

const sendToQueue = message =>
  new Promise((resolve, reject) => {
    connectToQueue((err, client) => {
      if (err) {
        reject(err);
      }
      putMessageOnQueue(client, message);
      client.disconnect();
      resolve();
    });
  });

// open.then(function(conn) {
//   return conn.createChannel();
// }).then(function(ch) {
//   return ch.assertQueue(q).then(function(ok) {
//     return ch.sendToQueue(q, Buffer.from('something to do'));
//   });
// }).catch(console.warn);

// SEND TO QUEUE -> put message 'string'
// int - consumer the queue (number of items)

// HOW TO DEAL WITH ERRORs?

// clear the queue

// LOGGING
// ERROR

// STOMPIT IMPLEMENTATION -> TRANSACTIONAL SENDING
// assume already have a client

// transaction.abort([options])

export { sendToQueue };
