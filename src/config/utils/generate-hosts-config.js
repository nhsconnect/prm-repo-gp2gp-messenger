import { generateQueueConfig } from './generate-queue-config';

const generateHostsConfig = queueUrls => {
  if (!Array.isArray(queueUrls))
    throw new Error('generateHostsConfig input must be an array of queue URLs');
  return queueUrls.map(queueUrl => generateQueueConfig(queueUrl));
};

export { generateHostsConfig };
