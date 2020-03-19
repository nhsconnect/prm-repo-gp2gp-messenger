import { extractManifestAsMessageIds } from '../extract-manifest-message-id';
import {
  multipleManifestReferences,
  noManifest,
  singleManifestReference
} from './data/extract-manifest-info';

describe('extractManifestAsMessageIds', () => {
  it('should return an empty array if passing in message with no manifest', () => {
    return expect(extractManifestAsMessageIds(noManifest)).resolves.toEqual([]);
  });

  it('should return an empty array if passing in message with a manifest with a single reference', () => {
    return expect(extractManifestAsMessageIds(singleManifestReference)).resolves.toEqual([
      'FE6A40B9-F4C6-4041-A306-EA2A149411CD'
    ]);
  });

  it('should return an empty array if passing in message with a manifest with a single reference', () => {
    return expect(extractManifestAsMessageIds(multipleManifestReferences)).resolves.toEqual([
      'FE6A40B9-F4C6-4041-A306-EA2A149411CD',
      '09D8E406-B106-4CCB-A3E3-C4EBC2F17BF8',
      '1FEE18C6-8184-4961-A848-7F13903A2ACF',
      '482CDD0C-C361-4961-99D6-ACF80B2FE17D'
    ]);
  });
});
