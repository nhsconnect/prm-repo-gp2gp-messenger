import { v4 as uuid } from 'uuid';
import dateFormat from 'dateformat';
import testData from './testData.json';
import { buildEhrAcknowledgement } from '../generate-ehr-acknowledgement';

describe('generateEhrAcknowledgement', () => {
  it('should return the acknowledgement message template with correct values', () => {
    const ackMessageTestValues = {
      conversationId: uuid().toUpperCase(),
      receivingAsid: testData.emisPractise.asid,
      sendingAsid: testData.mhs.asid,
      messageId: uuid().toUpperCase()
    };
    const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
    const returnValue = buildEhrAcknowledgement(ackMessageTestValues);

    expect(returnValue).toContain(ackMessageTestValues.messageId);
    expect(returnValue).toContain(ackMessageTestValues.conversationId);
    expect(returnValue).toContain(ackMessageTestValues.sendingAsid);
    expect(returnValue).toContain(ackMessageTestValues.receivingAsid);
    expect(returnValue).toContain(timestamp);
  });
});
