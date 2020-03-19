import { extractManifestInfo } from '../extract-manifest-info';
import {
  multipleManifestReferences,
  noManifest,
  singleManifestReference
} from './data/extract-manifest-info';

describe('extractManifestInfo', () => {
  const extractedManifests = [
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
  ];

  it('should extract the manifest reference information from XML body', () => {
    return expect(extractManifestInfo(singleManifestReference)).resolves.toEqual([
      {
        Description: {
          innerText: 'COPC_IN000001UK01',
          lang: 'en-GB'
        },
        href: 'cid:FE6A40B9-F4C6-4041-A306-EA2A149411CD@inps.co.uk/Vision/3',
        id: '_FE6A40B9-F4C6-4041-A306-EA2A149411CD'
      }
    ]);
  });

  it('should extract the manifest reference information from XML body in a real example', () => {
    return expect(extractManifestInfo(multipleManifestReferences)).resolves.toEqual(
      extractedManifests
    );
  });

  it('should return an empty array when manifest does not exist', () => {
    return expect(extractManifestInfo(noManifest)).resolves.toEqual([]);
  });
});
