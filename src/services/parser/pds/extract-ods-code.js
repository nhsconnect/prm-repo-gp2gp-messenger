import { XmlParser } from '../xml-parser/xml-parser';
import { logInfo } from '../../../middleware/logging';

export const extractOdsCode = message =>
  new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findAll('patientCareProvisionEvent'))
    .then(patientCareProvisionEvents => {
      logInfo('Total number of patientCareProvisionEvents: ' + patientCareProvisionEvents.length);
      const effectiveTime = getEffectiveTime(patientCareProvisionEvents);
      const odsCode = patientCareProvisionEvents.find(jsObject => jsObject.code.code === '1')
        .performer.assignedEntity.id.extension;
      logInfo(
        'Last patientCareProvisionEvent ods code: ' +
          odsCode +
          '. EffectiveTime: ' +
          JSON.stringify(effectiveTime)
      );
      return odsCode;
    })
    .catch(() => {
      throw Error('Failed to extract ODS Code');
    });

const getEffectiveTime = patientCareProvisionEvents => {
  const provisionEvent = patientCareProvisionEvents.find(pc => pc.effectiveTime);
  return provisionEvent ? provisionEvent.effectiveTime : '';
};
