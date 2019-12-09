import { S3 } from 'aws-sdk';
import config from '../config';
import logger from '../config/logging';

const save = (data, conversationId, messageId) => {
  const s3 = new S3();
  const key = `${conversationId}/${messageId}`;
  const parameters = {
    Bucket: config.awsS3BucketName,
    Key: key,
    Body: data
  };

  s3.putObject(parameters, () => {
    logger.info(`Successfully stored message in S3 bucket`);
  });
};

export default save;
