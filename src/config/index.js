const config = {
  deductionsAsid: process.env.DEDUCTIONS_ASID,
  deductionsOdsCode: process.env.DEDUCTIONS_ODS_CODE,
  isPTL: process.env.NODE_ENV !== 'local' && process.env.NODE_ENV !== 'dev',
  queueName: process.env.MHS_QUEUE_NAME,
  queueUrl1: process.env.MHS_QUEUE_URL_1,
  queueUrl2: process.env.MHS_QUEUE_URL_2,
  queueUsername: process.env.MHS_QUEUE_USERNAME,
  queuePassword: process.env.MHS_QUEUE_PASSWORD
};

export default config;
