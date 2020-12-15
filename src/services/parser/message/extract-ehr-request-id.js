import { XmlParser } from '../xml-parser';

export const extractEhrRequestId = message => {
  return new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findFirst('EhrRequest'))
    .then(ehrRequest => ehrRequest.id.root)
    .catch(err => {
      throw new Error(`Message does not contain EHR Request ID: ${err.message}`);
    });
};
