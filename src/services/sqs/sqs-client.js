import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const client = new SQSClient({ region: process.env.AWS_DEFAULT_REGION || 'eu-west-2' });
const sqsObservabilityQueueUrl = process.env.SQS_OBSERVABILITY_QUEUE_URL;

export const sendToQueue = async message => {
  try {
    // where we took the example
    // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/sqs-examples-send-receive-messages.html
    const params = {
      MessageBody: message,
      QueueUrl: sqsObservabilityQueueUrl
    };
    const command = new SendMessageCommand(params);
    //TODO: do we need to await and use the response, or this call can be a fire&forget operation?
    await client.send(command);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
