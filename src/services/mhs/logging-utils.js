import { logInfo } from '../../middleware/logging';

export const LOG_SIZE_LIMIT = 256 * 1024; // the 256 KB size limit of cloudWatch

export const logOutboundMessage = (message, loggerFunction) => {
  /*
  Helper function to log an outbound message which could possibly be over the size limit of cloudWatch
  Internally it is just composing removeBase64Payloads -> logLargeMessage.
  Accept an optional input `loggerFunction` in case we want to log in a different level than INFO
   */

  // If `loggerFunction` is not given or not a function, will use the default logInfo to log the message
  if (typeof loggerFunction !== 'function') {
    loggerFunction = logInfo;
  }

  if (typeof message !== 'object') {
    logInfo(
      'logOutboundMessage got an input which is not a JS object. It may not work as expected.'
    );
  }

  // TODO: wrap this in try catch to ensure that logging not affecting actual task in any case
  logLargeMessage(removeBase64Payloads(message), loggerFunction);
};
export const removeBase64Payloads = inputObject => {
  /*
    Recursively drill down the input object and remove any base64 payloads found.
    The initial input is assumed to be a JS object or an array containing JS objects.
   */
  if (inputObject === null || typeof inputObject !== 'object') {
    return inputObject;
  }

  if (Array.isArray(inputObject)) {
    return inputObject.map(removeBase64Payloads);
  }

  const result = {};
  for (let key in inputObject) {
    result[key] = removeBase64Payloads(inputObject[key]);
  }

  if (inputObject?.is_base64 === true && 'payload' in inputObject) {
    result['payload'] = '[REMOVED]';
  }

  return result;
};

export const logLargeMessage = (message, loggerFunction) => {
  /*
    A logging function that will try to keep a long message intact.
    If given message size is larger than 256KB, it will split the message into multiple lines,
    so that the full log is kept intact and not truncated by size limit.
    The input message is assumed to be a JS object.
 */

  // If `loggerFunction` is not given or not a function, will use the default logInfo to log the message
  if (typeof loggerFunction !== 'function') {
    loggerFunction = logInfo;
  }

  const messageAsString = JSON.stringify(message);
  if (messageAsString.length < LOG_SIZE_LIMIT) {
    loggerFunction(message);
  } else {
    logMessageInMultipleParts(messageAsString, loggerFunction);
  }
};

const logMessageInMultipleParts = (messageAsString, loggerFunction) => {
  /*
  Split a long message in multiple parts and log each of them in a human-readable and recoverable way.
  Give a number to each part as logging in cloudwatch may be not in right order
*/

  const lineLength = LOG_SIZE_LIMIT - 50; // leave some space for metadata "Part x of y"
  const numberOfParts = Math.ceil(messageAsString.length / lineLength);
  loggerFunction(
    `Received a message larger than the size limit of a single log. Attempt to log it in ${numberOfParts} parts`
  );

  for (let i = 0; i < numberOfParts; i++) {
    const startIndex = i * lineLength;
    const stringPart = messageAsString.slice(startIndex, startIndex + lineLength);
    loggerFunction(`Part ${i} of ${numberOfParts}: ${stringPart}`);
  }

  loggerFunction(`Finished logging all parts of the message.`);
};
