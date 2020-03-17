import { extractNhsNumber } from '../extract-nhs-number';

describe('extractNhsNumber', () => {
  const expectedErrorMessage = 'Message does not contain NHS number';

  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  const exampleResolveXML = `
        <eb:Body>
            <patient classCode="PAT"> <id root="2.16.840.1.113883.2.1.4.1" extension="1234567890"/> </patient>
        </eb:Body>
    `;

  it('should extract the NHS number from XML body', () => {
    return extractNhsNumber(exampleResolveXML).then(nhsNumber =>
      expect(nhsNumber).toBe('1234567890')
    );
  });

  it('should throw and error when NHS number does not exist', () => {
    return extractNhsNumber(exampleErrorXML).catch(err =>
      expect(err.message).toBe(expectedErrorMessage)
    );
  });
});
