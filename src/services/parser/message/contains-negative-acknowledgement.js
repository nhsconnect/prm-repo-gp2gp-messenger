export const containsNegativeAcknowledgement = message =>
  message.includes('<eb:acknowledgement typeCode="AR">') ||
  message.includes('<eb:acknowledgement typeCode="AE">');
