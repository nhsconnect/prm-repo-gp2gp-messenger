import { XmlParser } from '../xml-parser';

export const extractOdsCode = message => {
  return new XmlParser()
    .parse(message)
    .then(jsObject => jsObject.findFirst('author'))
    .then(author => author.AgentOrgSDS.agentOrganizationSDS.id.extension)
    .catch(err => {
      throw new Error(`message does not contain ods code: ${err.message}`);
    });
};
