import { extractFoundationSupplierAsid } from '../extract-supplier-asid';

describe('extractFoundationSupplierAsid', () => {
  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  const expectedErrorMessage = 'Message does not contain foundation supplier ASID';

  const testFoundationSupplierAisd = '715373337545';

  const realExample = `
    <RCMR_IN030000UK06>
        <id root="C258107F-7A3F-4FB5-8B36-D7C0F6496A17" />
        <communicationFunctionRcv typeCode="RCV">
            <device classCode="DEV" determinerCode="INSTANCE">
                <id root="1.2.826.0.1285.0.2.0.107" extension="276827251543" />
            </device>
        </communicationFunctionRcv>
        <communicationFunctionSnd typeCode="SND">
            <device classCode="DEV" determinerCode="INSTANCE">
                <id root="1.2.826.0.1285.0.2.0.107" extension="${testFoundationSupplierAisd}" />
            </device>
        </communicationFunctionSnd>
    </RCMR_IN030000UK06>
    `;

  const exampleResolveXML = `
        <eb:Body>
            <communicationFunctionSnd typeCode="SND">
                <id root="1.2.826.0.1285.0.2.0.107" extension="${testFoundationSupplierAisd}" />
            </communicationFunctionSnd>
        </eb:Body>
    `;

  it('should extract the conversationId from XML body', () => {
    expect(extractFoundationSupplierAsid(exampleResolveXML)).toBe(testFoundationSupplierAisd);
  });

  it('should extract the conversationId from XML body in a real example', () => {
    expect(extractFoundationSupplierAsid(realExample)).toBe(testFoundationSupplierAisd);
  });

  it('should throw and error when conversationId does not exist', () => {
    expect(() => extractFoundationSupplierAsid(exampleErrorXML)).toThrow(
      Error(expectedErrorMessage)
    );
  });
});
