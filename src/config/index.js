const config = {
  deductionsAsid: process.env.DEDUCTIONS_ASID,
  deductionsOdsCode: process.env.DEDUCTIONS_ODS_CODE,
  isPTL: process.env.NODE_ENV !== 'local' && process.env.NODE_ENV !== 'dev'
};

export default config;
