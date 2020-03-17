import { XmlParser } from '../xml-parser';

export const extractNhsNumber = message =>
  new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findFirst('patient'))
    .then(patient => patient.id.extension)
    .catch(() => {
      throw Error('Message does not contain NHS number');
    });
