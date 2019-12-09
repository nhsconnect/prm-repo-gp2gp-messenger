import handleMessage from './message-handler';
import fileSave from '../storage/file-system';
import config from '../config';
import s3Save from '../storage/s3';

jest.mock('../storage/file-system');
jest.mock('../storage/s3');

describe('handleMessage', () => {
  const conversationId = 'some-conversation-id-123';
  const messageId = 'some-message-id-456';
  const message = `
    <SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:ConversationId>${conversationId}</eb:ConversationId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>
    `;

  it('should store the message in local storage if environment is local', () => {
    config.isLocal = true;

    handleMessage(message);

    expect(fileSave).toHaveBeenCalledWith(message, conversationId, messageId);
  });

  it('should store the message in s3 if environment is not local', () => {
    config.isLocal = false;

    handleMessage(message);

    expect(s3Save).toHaveBeenCalledWith(message, conversationId, messageId);
  });
});
