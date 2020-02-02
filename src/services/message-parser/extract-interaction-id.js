import { XmlParser } from './xml-parser';

export const extractInteractionId = async message => {
  const interactionId = await new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findFirst('interactionId'))
    .then(interactionId => interactionId.extension);
  return interactionId;
};
