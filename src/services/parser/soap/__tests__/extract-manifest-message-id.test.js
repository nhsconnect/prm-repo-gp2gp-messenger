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

  // FIXME: Test description doesn't match the expectation
  it('should return an empty array if passing in message with a manifest with a single reference', () => {
    return expect(extractManifestAsMessageIds(singleManifestReference)).resolves.toEqual([
      'fe6a40b9-f4c6-4041-a306-ea2a149411cd'
    ]);
  });

  it('should transform ids to lower case', () => {
    return expect(extractManifestAsMessageIds(multipleManifestReferences)).resolves.toEqual([
      'fe6a40b9-f4c6-4041-a306-ea2a149411cd',
      '09d8e406-b106-4ccb-a3e3-c4ebc2f17bf8',
      '1fee18c6-8184-4961-a848-7f13903a2acf',
      '482cdd0c-c361-4961-99d6-acf80b2fe17d'
    ]);
  });

  // FIXME: Test description doesn't match the expectation
  it('should return an empty array if passing in message with a manifest with a single reference', () => {
    return expect(extractManifestAsMessageIds(multipleManifestReferences)).resolves.toEqual([
      'fe6a40b9-f4c6-4041-a306-ea2a149411cd',
      '09d8e406-b106-4ccb-a3e3-c4ebc2f17bf8',
      '1fee18c6-8184-4961-a848-7f13903a2acf',
      '482cdd0c-c361-4961-99d6-acf80b2fe17d'
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
