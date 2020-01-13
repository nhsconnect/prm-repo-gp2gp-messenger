import { Endpoint, S3 } from 'aws-sdk';
import config from '../config';
import { updateLogEvent } from '../middleware/logging';
import moment from 'moment';

export default class S3Service {
  constructor(conversationId, messageId) {
    this.s3 = new S3(this._get_config());

    this.parameters = {
      Bucket: config.awsS3BucketName,
      Key: `${conversationId}/${messageId}`
    };
  }

  checkS3Health() {
    const result = {
      type: 's3',
      bucketName: config.awsS3BucketName,
      available: true,
      writable: false
    };

    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    return this.save(date)
      .then(() => ({ ...result, writable: true }))
      .catch(err => ({ ...result, error: err }));
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
        updateLogEvent({ storage: { removed: true } });
        resolve();
      });
    });
  }

  _get_config() {
    if (!config.isLocal) return {};

    return {
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      endpoint: new Endpoint(process.env.LOCALSTACK_URL),
      s3ForcePathStyle: true
    };
  }
}
