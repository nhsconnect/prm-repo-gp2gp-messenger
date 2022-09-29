import { updateFragmentForSending } from '../update-fragment-for-sending';
import { XmlParser } from '../../xml-parser/xml-parser';
import { templateLargeEhrFragmentMessage } from '../../../../templates/message-fragment-payload-template';

describe('updateFragmentForSending', () => {
  xit('WIP should update ehr fragment payload with new sender, recipient and message identifiers', async () => {
    const originalFragment = templateLargeEhrFragmentMessage(
      'old-message-id',
      'old-recipient-asid',
      'old-sending-asid',
      'old-recipient-ods-code',
      'old-sending-ods-code'
    );

    const expectedFragment = templateLargeEhrFragmentMessage(
      'new-message-id',
      'new-recipient-asid',
      'new-sending-asid',
      'new-recipient-ods-code',
      'new-sending-ods-code'
    );

    const newFragment = await updateFragmentForSending(
      originalFragment,
      'new-message-id',
      'new-recipient-asid',
      'new-sending-asid',
      'new-recipient-ods-code',
      'new-sending-ods-code'
    );

    const parsedNewFragment = await new XmlParser().parse(newFragment);
    const parsedExpectedFragment = await new XmlParser().parse(expectedFragment);
    expect(parsedNewFragment).toEqual(parsedExpectedFragment);
  });
});
