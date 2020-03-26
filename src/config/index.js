const portNumber = 3000;

const initialiseConfig = () => ({
  deductionsAsid: process.env.DEDUCTIONS_ASID || '200000001161',
  deductionsOdsCode: process.env.DEDUCTIONS_ODS_CODE || 'B86041',
  queueName: process.env.MHS_QUEUE_NAME,
  unhandledMessagesQueueName: 'unhandled-raw-inbound',
  queueUrls: [process.env.MHS_QUEUE_URL_1, process.env.MHS_QUEUE_URL_2],
  queueVirtualHost: process.env.MHS_QUEUE_VIRTUAL_HOST,
  queueUsername: process.env.MHS_QUEUE_USERNAME,
  queuePassword: process.env.MHS_QUEUE_PASSWORD,
  awsS3BucketName: process.env.S3_BUCKET_NAME,
  ehrRepoUrl: process.env.EHR_REPO_URL,
  pdsAsid: process.env.PDS_ASID || '928942012545',
  mhsOutboundUrl: process.env.MHS_OUTBOUND_URL,
  nodeEnv: process.env.NODE_ENV || 'local',
  url: process.env.SERVICE_URL || `http://127.0.0.1:${portNumber}`
});

export default initialiseConfig();

export { portNumber, initialiseConfig };
