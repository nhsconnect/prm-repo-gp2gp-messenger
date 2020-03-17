import { extractPdsId } from '../parser/pds/extract-pds-id';
import { extractSerialChangeNumber } from '../parser/pds/extract-serial-change-number';

export const parsePdsResponse = async message => {
  const extractedMessage = await Promise.all([
    extractSerialChangeNumber(message),
    extractPdsId(message)
  ]).catch(err => {
    throw Error(err);
  });
  return {
    serialChangeNumber: extractedMessage[0],
    patientPdsId: extractedMessage[1]
  };
};
