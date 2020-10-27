import { XmlParser } from '../xml-parser';

export const extractOdsCode = message =>
  new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findAll('patientCareProvisionEvent'))
    .then(
      jsObjectArray =>
        jsObjectArray.find(jsObject => jsObject.code.code === '1').performer.assignedEntity.id
          .extension
    )
    .catch(() => {
      throw Error('Failed to extract ODS Code');
    });
