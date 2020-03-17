import { v4 as uuid } from 'uuid';
import { extractConversationId } from '../extract-conversation-id';

describe('extractConversationId', () => {
  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  const expectedErrorMessage = `The key 'ConversationId' was not found in the message`;

  const testConversationId = uuid().toUpperCase();

  const realExample = `
    <SOAP:Envelope>
      <SOAP:Header>
          <eb:MessageHeader SOAP:mustUnderstand="1" eb:version="2.0">
              <eb:ConversationId>${testConversationId}</eb:ConversationId>
          </eb:MessageHeader>
      </SOAP:Header>
    </SOAP:Envelope>
    `;

  const exampleResolveXML = `
        <eb:Body>
            <eb:ConversationId>${testConversationId}</eb:ConversationId>
        </eb:Body>
    `;

  it('should extract the conversationId from XML body', () => {
    return extractConversationId(exampleResolveXML).then(conversationId => {
      return expect(conversationId).toBe(testConversationId);
    });
  });

  it('should extract the conversationId from XML body in a real example', () => {
    return extractConversationId(realExample).then(conversationId =>
      expect(conversationId).toBe(testConversationId)
    );
  });

  it('should throw and error when conversationId does not exist', () => {
    return expect(extractConversationId(exampleErrorXML)).rejects.toThrow(
      Error(expectedErrorMessage)
    );
  });
});
