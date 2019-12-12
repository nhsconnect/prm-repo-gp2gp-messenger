import { promises as fsPromises } from 'fs';
import save from './file-system';
import uuid from 'uuid/v4';
import { updateLogEvent } from '../middleware/logging';

jest.mock('../middleware/logging');

describe('save', () => {
  it('should store the data in the local-datastore folder', () => {
    const messageId = `some-message-id-${uuid()}`;
    return save('some-data', 'some-conversation-id', messageId)
      .then(() =>
        fsPromises.readFile(`./local-datastore/some-conversation-id/${messageId}`, 'utf8')
      )
      .then(fileContents => {
        expect(fileContents).toEqual('some-data');
      });
  });

  it('should update the log event', () => {
    const messageId = `some-message-id-${uuid()}`;
    return save('some-data', 'some-conversation-id', messageId).then(() => {
      expect(updateLogEvent).toHaveBeenCalledWith({
        storage: { path: `./local-datastore/some-conversation-id/${messageId}` }
      });
    });
  });
});
