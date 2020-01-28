import { extractInteractionId } from './extract-interaction-id';

describe('extractInteractionId', () => {
  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  const expectedErrorMessage = 'Message does not contain interaction id';

  const testInteractionId = 'RCMR_IN030000UK05';

  const realExample = `
    <RCMR_IN030000UK05>
        <id root="C258107F-7A3F-4FB5-8B36-D7C0F6496A17" />
        <interactionId root="2.16.840.1.113883.2.1.3.2.4.12"
            extension="${testInteractionId}" />
    </RCMR_IN030000UK05>
    `;

  const exampleResolveXML = `
        <eb:Body>
            <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="${testInteractionId}" />
        </eb:Body>
    `;

  it('should extract the conversationId from XML body', () => {
    expect(extractInteractionId(exampleResolveXML)).toBe(testInteractionId);
  });

  it('should extract the conversationId from XML body in a real example', () => {
    expect(extractInteractionId(realExample)).toBe(testInteractionId);
  });

  it('should throw and error when conversationId does not exist', () => {
    expect(() => extractInteractionId(exampleErrorXML)).toThrow(Error(expectedErrorMessage));
  });
});
