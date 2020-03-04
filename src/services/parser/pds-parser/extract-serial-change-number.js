import { XmlParser } from '../xml-parser';

export const extractSerialChangeNumber = async message => {
  const serialChangeNumber = await new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findFirst('pertinentSerialChangeNumber'))
    .then(jsObject => jsObject.value.value);
  return serialChangeNumber;
};
