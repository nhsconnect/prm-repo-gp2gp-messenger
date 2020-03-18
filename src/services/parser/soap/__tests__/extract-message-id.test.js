import { v4 as uuid } from 'uuid';
import { extractMessageId } from '../extract-message-id';

describe('extractMessageId', () => {
  const expectedErrorMessage = `The key 'MessageId' was not found in the message`;

  const testMessageId = uuid().toUpperCase();

  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  const realExample = `
    <SOAP:Header>
        <eb:MessageHeader SOAP:mustUnderstand="1" eb:version="2.0">
            <eb:MessageData>
			          <eb:MessageId>${testMessageId}</eb:MessageId>
			          <eb:Timestamp>2013-10-25T16:59:29Z</eb:Timestamp>
		        </eb:MessageData>
        </eb:MessageHeader>
    </SOAP:Header>
    `;

  const exampleResolveXML = `
        <eb:Body>
            <eb:MessageId>${testMessageId}</eb:MessageId>
        </eb:Body>
    `;

  it('should extract the messageId from XML body', () => {
    return expect(extractMessageId(exampleResolveXML)).resolves.toBe(testMessageId);
  });

  it('should extract the messageId from XML body in a real example', () => {
    return expect(extractMessageId(realExample)).resolves.toBe(testMessageId);
  });

  it('should throw an error when messageId does not exist', () => {
    return expect(extractMessageId(exampleErrorXML)).rejects.toEqual(Error(expectedErrorMessage));
  });
});
