import { XmlParser } from './xml-parser';

export const extractInteractionId = message => {
  return new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findFirst('interactionId'))
    .then(interactionId => interactionId.extension);
};
