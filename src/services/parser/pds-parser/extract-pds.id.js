import { XmlParser } from '../xml-parser';

export const extractPdsId = async message => {
  const pdsId = await new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findAll('patientCareProvisionEvent'))
    .then(jsObjectArray => {
      return jsObjectArray.find(jsObject => jsObject.code.code === '1').id.extension;
    })
    .catch(() => {
      throw new Error('failed to extract PDS Id');
    });
  return pdsId;
};
