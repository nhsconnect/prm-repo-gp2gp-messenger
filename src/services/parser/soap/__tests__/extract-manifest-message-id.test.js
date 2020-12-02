import { logError } from '../../../../middleware/logging';
import { extractManifestAsMessageIds } from '../extract-manifest-message-id';
import {
  manifestIdNotUuid,
  multipleManifestReferences,
  noManifest,
  singleManifestReference
} from './data/extract-manifest-info';

jest.mock('../../../../middleware/logging');

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

  describe('when message ID is not a UUID', () => {
    it('should resolve to an empty array', () => {
      return expect(extractManifestAsMessageIds(manifestIdNotUuid)).resolves.toEqual([]);
    });

    it('should call logError with "Unable to extract manifest message Id from cid:payload@tpp-uk.com/SystmOne/GP2GP1.1A,cid:attachment1.0@test.com"', async done => {
      await extractManifestAsMessageIds(manifestIdNotUuid);
      expect(logError).toHaveBeenCalledWith(
        'Unable to extract manifest message Id from cid:payload@tpp-uk.com/SystmOne/GP2GP1.1A,cid:attachment1.0@test.com'
      );
      done();
    });
  });
});
