import { XmlParser } from '../xml-parser';

export const extractInteractionId = message =>
  new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findFirst('interactionId'))
    .then(interactionId => interactionId.extension);
