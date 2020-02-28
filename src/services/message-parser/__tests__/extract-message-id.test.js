import uuid from 'uuid/v4';
import { extractMessageId } from '../extract-message-id';

describe('extractMessageId', () => {
  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  const expectedErrorMessage = 'Message does not contain message id';

  const testMessageId = uuid().toUpperCase();

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

  it('should extract the conversationId from XML body', () => {
    expect(extractMessageId(exampleResolveXML)).toBe(testMessageId);
  });

  it('should extract the conversationId from XML body in a real example', () => {
    expect(extractMessageId(realExample)).toBe(testMessageId);
  });

  it('should throw and error when conversationId does not exist', () => {
    expect(() => extractMessageId(exampleErrorXML)).toThrow(Error(expectedErrorMessage));
  });
});
