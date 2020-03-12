import { extractManifestInfo } from '../soap-parser/extract-manifest-info';

describe('extractManifestInfo', () => {
  const expectedErrorMessage = 'Message does not contain manifestInfo';
  const exampleErrorXML = `
        <eb:Body>
        </eb:Body>
    `;

  const realExample = `
    <SOAP-ENV:Body>
        <eb:Manifest eb:version="2.0">
            <eb:Reference eb:id="_FE6A40B9-F4C6-4041-A306-EA2A149411CD" xlink:href="cid:FE6A40B9-F4C6-4041-A306-EA2A149411CD@inps.co.uk/Vision/3">
                <eb:Description xml:lang="en-GB">COPC_IN000001UK01</eb:Description>
                <hl7ebXML:Payload encoding="XML" style="HL7" version="3.0"/>
            </eb:Reference>
            <eb:Reference eb:id="_09D8E406-B106-4CCB-A3E3-C4EBC2F17BF8" xlink:href="cid:09D8E406-B106-4CCB-A3E3-C4EBC2F17BF8@inps.co.uk/Vision/3">
                <eb:Description xml:lang="en-GB">Filename="588210BB-401D-41F9-84D2-978697CEEFE5_00011000.tif" ContentType=image/tiff Compressed=No LargeAttachment=No OriginalBase64=No Length=4718592</eb:Description>
            </eb:Reference>
            <eb:Reference eb:id="_1FEE18C6-8184-4961-A848-7F13903A2ACF" xlink:href="mid:1FEE18C6-8184-4961-A848-7F13903A2ACF">
                <eb:Description xml:lang="en-GB">Filename="588210BB-401D-41F9-84D2-978697CEEFE5_00011000.tif" ContentType=image/tiff Compressed=No LargeAttachment=No OriginalBase64=Yes Length=4718592</eb:Description>
            </eb:Reference>
            <eb:Reference eb:id="_482CDD0C-C361-4961-99D6-ACF80B2FE17D" xlink:href="mid:482CDD0C-C361-4961-99D6-ACF80B2FE17D">
                <eb:Description xml:lang="en-GB">Filename="588210BB-401D-41F9-84D2-978697CEEFE5_00011000.tif" ContentType=image/tiff Compressed=No LargeAttachment=No OriginalBase64=Yes Length=3448920</eb:Description>
            </eb:Reference>
        </eb:Manifest>
    </SOAP-ENV:Body>
    `;

  const exampleResolveXML = `
    <SOAP-ENV:Body>
        <eb:Manifest eb:version="2.0">
            <eb:Reference eb:id="_FE6A40B9-F4C6-4041-A306-EA2A149411CD" xlink:href="cid:FE6A40B9-F4C6-4041-A306-EA2A149411CD@inps.co.uk/Vision/3">
                <eb:Description xml:lang="en-GB">COPC_IN000001UK01</eb:Description>
            </eb:Reference>
        </eb:Manifest>
    </SOAP-ENV:Body>
    `;

  const extractedManifests = [
    {
      Reference: [
        {
          Description: {
            innerText: 'COPC_IN000001UK01',
            lang: 'en-GB'
          },
          Payload: {
            encoding: 'XML',
            style: 'HL7',
            version: '3.0'
          },
          href: 'cid:FE6A40B9-F4C6-4041-A306-EA2A149411CD@inps.co.uk/Vision/3',
          id: '_FE6A40B9-F4C6-4041-A306-EA2A149411CD'
        },
        {
          Description: {
            innerText:
              'Filename="588210BB-401D-41F9-84D2-978697CEEFE5_00011000.tif" ContentType=image/tiff Compressed=No LargeAttachment=No OriginalBase64=No Length=4718592',
            lang: 'en-GB'
          },
          href: 'cid:09D8E406-B106-4CCB-A3E3-C4EBC2F17BF8@inps.co.uk/Vision/3',
          id: '_09D8E406-B106-4CCB-A3E3-C4EBC2F17BF8'
        },
        {
          Description: {
            innerText:
              'Filename="588210BB-401D-41F9-84D2-978697CEEFE5_00011000.tif" ContentType=image/tiff Compressed=No LargeAttachment=No OriginalBase64=Yes Length=4718592',
            lang: 'en-GB'
          },
          href: 'mid:1FEE18C6-8184-4961-A848-7F13903A2ACF',
          id: '_1FEE18C6-8184-4961-A848-7F13903A2ACF'
        },
        {
          Description: {
            innerText:
              'Filename="588210BB-401D-41F9-84D2-978697CEEFE5_00011000.tif" ContentType=image/tiff Compressed=No LargeAttachment=No OriginalBase64=Yes Length=3448920',
            lang: 'en-GB'
          },
          href: 'mid:482CDD0C-C361-4961-99D6-ACF80B2FE17D',
          id: '_482CDD0C-C361-4961-99D6-ACF80B2FE17D'
        }
      ],
      version: '2.0'
    }
  ];

  it('should extract the manifest from XML body', () => {
    return extractManifestInfo(exampleResolveXML).then(messageId =>
      expect(messageId).toEqual([
        {
          Reference: {
            Description: {
              innerText: 'COPC_IN000001UK01',
              lang: 'en-GB'
            },
            href: 'cid:FE6A40B9-F4C6-4041-A306-EA2A149411CD@inps.co.uk/Vision/3',
            id: '_FE6A40B9-F4C6-4041-A306-EA2A149411CD'
          },
          version: '2.0'
        }
      ])
    );
  });

  it('should extract the manifest from XML body in a real example', () => {
    return extractManifestInfo(realExample).then(messageId =>
      expect(messageId).toEqual(extractedManifests)
    );
  });

  it('should throw an error when manifest does not exist', done => {
    expect(extractManifestInfo(exampleErrorXML)).rejects.toThrow(expectedErrorMessage);
    done();
  });
});
