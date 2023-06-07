import { updateExtractForSending } from '../update-extract-for-sending';
import { readFileSync } from 'fs';
import * as path from 'path';
import { v4 } from 'uuid';
import { XmlParser } from '../../xml-parser/xml-parser';

export const templateEhrExtract = (
  receivingAsid,
  sendingAsid,
  priorEhrRequestId,
  authorOdsCode
) => {
  const template = readFileSync(path.join(__dirname, 'data', 'templateEhrExtract'), 'utf-8');
  return template
    .replaceAll('${receivingAsid}', receivingAsid)
    .replaceAll('${sendingAsid}', sendingAsid)
    .replaceAll('${priorEhrRequestId}', priorEhrRequestId)
    .replaceAll('${authorOdsCode}', authorOdsCode);
};

describe('updateExtractForSending', () => {
  it('should use the new ehr request id, sending asid and receiving asid - as well as overriding author with sending ods code as TPP uses it for COPC continue message destination', async () => {
    const oldSendingAsid = '200000000149';
    const oldReceivingAsid = '200000001161';
    const oldEhrRequestId = 'BBBBA01A-A9D1-A411-F824-9F7A00A33757';
    const originalEhrExtract = templateEhrExtract(
      oldReceivingAsid,
      oldSendingAsid,
      oldEhrRequestId,
      'some-old-author-ods-code'
    );

    const newSendingAsid = '200000001161';
    const newReceivingAsid = '200000001162';
    const ehrRequestId = v4();
    const expectedEhrExtract = templateEhrExtract(
      newReceivingAsid,
      newSendingAsid,
      ehrRequestId,
      'sending-ods-code'
    );

    const newEhrExtract = await updateExtractForSending(
      originalEhrExtract,
      ehrRequestId,
      newReceivingAsid,
      'sending-ods-code'
    );

    const parsedNewEhrExtract = await new XmlParser().parse(newEhrExtract);
    const parsedExpectedEhrExtract = await new XmlParser().parse(expectedEhrExtract);
    expect(parsedNewEhrExtract).toEqual(parsedExpectedEhrExtract);
  });

  it('should keep escaped special characters (linebreak, apostrophes, quotation marks) unchanged', async () => {
    // given
    const oldSendingAsid = '200000000149';
    const oldReceivingAsid = '200000001161';
    const oldEhrRequestId = 'BBBBA01A-A9D1-A411-F824-9F7A00A33757';
    const originalEhrExtract = templateEhrExtract(
      oldReceivingAsid,
      oldSendingAsid,
      oldEhrRequestId,
      'some-old-author-ods-code'
    );

    // manually add some escaped special characters to the ehr extract
    const replacedText =
      'Drinking status on eventdate: &#10;&#10;&#10; &apos; &quot; &Current drinker';
    const ehrExtractWithSpecialChars = originalEhrExtract.replace(
      'Drinking status on eventdate: Current drinker',
      replacedText
    );

    const newReceivingAsid = '200000001162';
    const ehrRequestId = v4();

    const newEhrExtract = await updateExtractForSending(
      ehrExtractWithSpecialChars,
      ehrRequestId,
      newReceivingAsid,
      'sending-ods-code'
    );

    expect(newEhrExtract.includes(replacedText)).toBe(true);
  });
});
