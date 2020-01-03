import { S3 } from 'aws-sdk';
import config from '../config';
import { updateLogEvent } from '../middleware/logging';

export default class S3Service {
  constructor(conversationId, messageId) {
    this.s3 = new S3();
    this.parameters = {
      Bucket: config.awsS3BucketName,
      Key: `${conversationId}/${messageId}`
    };
  }

  save(data) {
    return new Promise((resolve, reject) => {
      this.s3.putObject({ ...this.parameters, Body: data }, err => {
        if (err) return reject(err);
        updateLogEvent({ storage: { path: `${this.parameters.Bucket}/${this.parameters.Key}` } });
        resolve();
      });
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(this.parameters, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
