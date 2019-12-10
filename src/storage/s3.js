import { S3 } from 'aws-sdk';
import config from '../config';

const save = (data, conversationId, messageId) =>
  new Promise((resolve, reject) => {
    const s3 = new S3();
    const key = `${conversationId}/${messageId}`;
    const parameters = {
      Bucket: config.awsS3BucketName,
      Key: key,
      Body: data
    };

    s3.putObject(parameters, err => {
      if (err) return reject(err);
      resolve();
    });
  });

export default save;
