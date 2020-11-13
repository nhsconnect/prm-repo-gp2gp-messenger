import { v4 as uuid } from 'uuid';
import dateFormat from 'dateformat';
import testData from './testData.json';
import { buildEhrAcknowledgement } from '../generate-ehr-acknowledgement';

describe('generateEhrAcknowledgement', () => {
  it('should return the acknowledgement message template', () => {
    const messageId = uuid().toUpperCase();
    const ackMessageTestValues = {
      conversationId: uuid().toUpperCase(),
      timestamp: dateFormat(Date.now(), 'yyyymmddHHMMss'),
      sendingServiceAsid: testData.mhs.asid,
      receivingServiceAsid: testData.emisPractise.asid,
      messageId
    };
    const returnValue = buildEhrAcknowledgement(ackMessageTestValues);
    expect(returnValue).toContain(ackMessageTestValues.messageId);
  });
});
