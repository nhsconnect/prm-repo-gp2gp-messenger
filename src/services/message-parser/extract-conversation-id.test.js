import uuid from 'uuid/v4';
import { extractConversationId } from './extract-conversation-id';

describe('extractConversationId', () => {
  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  const expectedErrorMessage = 'Message does not contain conversation id';

  const testConversationId = uuid().toUpperCase();

  const realExample = `
    <SOAP:Header>
        <eb:MessageHeader SOAP:mustUnderstand="1" eb:version="2.0">
            <eb:ConversationId>${testConversationId}</eb:ConversationId>
        </eb:MessageHeader>
    </SOAP:Header>
    `;

  const exampleResolveXML = `
        <eb:Body>
            <eb:ConversationId>${testConversationId}</eb:ConversationId>
        </eb:Body>
    `;

  it('should extract the conversationId from XML body', () => {
    expect(extractConversationId(exampleResolveXML)).toBe(testConversationId);
  });

  it('should extract the conversationId from XML body in a real example', () => {
    expect(extractConversationId(realExample)).toBe(testConversationId);
  });

  it('should throw and error when conversationId does not exist', () => {
    expect(() => extractConversationId(exampleErrorXML)).toThrow(Error(expectedErrorMessage));
  });
});
