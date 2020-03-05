import { XmlParser } from '../xml-parser';

export const extractPdsId = async message => {
  const pdsId = await new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findAll('patientCareProvisionEvent'))
    .then(jsObjectArray => jsObjectArray.find(jsObject => jsObject.code.code === '1').id.extension)
    .catch(err => {
      throw Error('failed to extract PDS Id ', err);
    });
  return pdsId;
};
