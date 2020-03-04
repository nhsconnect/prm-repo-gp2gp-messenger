import { XmlParser } from '../parser/xml-parser';

export const validatePdsResponse = async message => {
  const interactionId = await new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findAll('QUQI_IN010000UK14'))
    .then(queryFailure => (queryFailure.length > 0 ? false : true));
  return interactionId;
};
