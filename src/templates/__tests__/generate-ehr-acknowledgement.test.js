import dateFormat from 'dateformat';
import testData from './testData.json';
import { buildEhrAcknowledgementPayload } from '../generate-ehr-acknowledgement';
import { XmlParser } from '../../services/parser/xml-parser/xml-parser';

function parse(payload) {
  return new XmlParser().parse(payload);
}

describe('generateEhrAcknowledgement', () => {
  it('should return the acknowledgement message template with correct values populated', async () => {
    const parameters = {
      acknowledgementMessageId: '11111111-28C0-41EB-ADC1-0242AC120002',
      receivingAsid: testData.emisPractise.asid,
      sendingAsid: testData.mhs.asid,
      acknowledgedMessageId: '22222222-28C0-41EB-ADC1-0242AC120002'
    };
    const timestamp = dateFormat(Date.now(), 'yyyymmddHHMMss');
    const payload = buildEhrAcknowledgementPayload(parameters);

    const ack = (await new XmlParser().parse(payload)).data.MCCI_IN010000UK13;

    expect(ack.id).toEqual({ root: parameters.acknowledgementMessageId });
    expect(ack.acknowledgement.messageRef.id).toEqual({ root: parameters.acknowledgedMessageId });

    expect(payload).toContain(parameters.sendingAsid);
    expect(payload).toContain(parameters.receivingAsid);
    expect(payload).toContain(timestamp);
  });

  it('should populate the acknowledgement message forcing message IDs to uppercase', async () => {
    const parameters = {
      acknowledgementMessageId: '11111111-28c0-41eb-adc1-0242ac120002',
      receivingAsid: testData.emisPractise.asid,
      sendingAsid: testData.mhs.asid,
      acknowledgedMessageId: '22222222-28c0-41eb-adc1-0242ac120002'
    };
    const payload = buildEhrAcknowledgementPayload(parameters);

    const ack = (await parse(payload)).data.MCCI_IN010000UK13;

    expect(ack.id).toEqual({ root: parameters.acknowledgementMessageId.toUpperCase() });
    expect(ack.acknowledgement.messageRef.id).toEqual({
      root: parameters.acknowledgedMessageId.toUpperCase()
    });
  });
});
