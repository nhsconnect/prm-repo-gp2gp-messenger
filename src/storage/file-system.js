import { promises as fsPromises } from 'fs';
import { updateLogEvent } from '../middleware/logging';

const save = (data, conversationId, messageId) => {
  const directory = `./local-datastore/${conversationId}`;
  const fileName = `${directory}/${messageId}`;
  updateLogEvent({ storage: { path: fileName } });
  return fsPromises
    .mkdir(directory, { recursive: true })
    .then(() => fsPromises.writeFile(fileName, data));
};

export default save;
