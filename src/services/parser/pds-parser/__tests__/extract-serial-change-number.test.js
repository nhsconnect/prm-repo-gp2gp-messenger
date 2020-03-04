import { extractSerialChangeNumber } from '../extract-serial-change-number';

describe('extractSerialChangeNumber', () => {
  const testSerialChangeNumber = '2';

  const exampleResolveXML = `
      <pertinentSerialChangeNumber classCode="OBS" moodCode="EVN">
        <code code="2" codeSystem="2.16.840.1.113883.2.1.3.2.4.17.35"/>
        <value value="${testSerialChangeNumber}"/>
      </pertinentSerialChangeNumber>
    `;

  it('should extract the conversationId from XML body', () => {
    return extractSerialChangeNumber(exampleResolveXML).then(serialChangeNumber =>
      expect(serialChangeNumber).toBe(testSerialChangeNumber)
    );
  });
});
