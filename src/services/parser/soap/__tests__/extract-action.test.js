import { extractAction } from '../extract-action';

describe('extractAction', () => {
  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  const testAction = 'RCMR_IN030000UK06';

  const realExample = `

    <SOAP:Header>
        <eb:MessageHeader SOAP:mustUnderstand="1" eb:version="2.0">
            <eb:Action>${testAction}</eb:Action>
        </eb:MessageHeader>
    </SOAP:Header>
    `;

  const exampleResolveXML = `
        <eb:Body>
            <eb:Action>${testAction}</eb:Action>
        </eb:Body>
    `;

  it('should extract the conversationId from XML body', () => {
    return expect(extractAction(exampleResolveXML)).resolves.toBe(testAction);
  });

  it('should extract the conversationId from XML body in a real example', () => {
    return expect(extractAction(realExample)).resolves.toBe(testAction);
  });

  it('should throw and error when conversationId does not exist', () => {
    return expect(extractAction(exampleErrorXML)).rejects.toEqual(
      Error("The key 'Action' was not found in the message")
    );
  });
});
