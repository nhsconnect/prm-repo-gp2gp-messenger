import { v4 as uuid } from 'uuid';
import { extractMessageId } from '../soap-parser/extract-message-id';

describe('extractMessageId', () => {
  const expectedErrorMessage = 'Message does not contain message id';

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
    return extractMessageId(exampleResolveXML).then(messageId =>
      expect(messageId).toBe(testMessageId)
    );
  });

  it('should extract the messageId from XML body in a real example', () => {
    return extractMessageId(realExample).then(messageId => expect(messageId).toBe(testMessageId));
  });

  it('should throw and error when messageId does not exist', () => {
    return extractMessageId(exampleErrorXML).catch(err =>
      expect(err.message).toBe(expectedErrorMessage)
    );
  });
});
