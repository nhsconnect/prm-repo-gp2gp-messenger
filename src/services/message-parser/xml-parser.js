import xml2js from 'xml2js';

const parserOptions = {
  // Changes key name from '_' to 'innerText'
  charkey: 'innerText',

  // Only multiple defined children are put into Array instead of everything
  explicitArray: false,

  // Puts attributes inside the object that they're associated with
  mergeAttrs: true,

  // Removes SOAP and eb prefixes from '$'
  attrNameProcessors: [xml2js.processors.stripPrefix],

  // Removes SOAP and eb prefixes from '_'
  tagNameProcessors: [xml2js.processors.stripPrefix]
};

export const fromXml = rawXml => new xml2js.Parser(parserOptions).parseStringPromise(rawXml);
