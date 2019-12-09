import { promises as fsPromises } from 'fs';

const save = (data, conversationId, messageId) => {
  const directory = `./local-datastore/${conversationId}`;
  const fileName = `${directory}/${messageId}`;
  return fsPromises
    .mkdir(directory, { recursive: true })
    .then(() => fsPromises.writeFile(fileName, data));
};

export default save;
