import { extractSerialChangeNumber } from '../parser/pds-parser/extract-serial-change-number';
import { extractPdsId } from '../parser/pds-parser/extract-pds.id';

export const parsePdsResponse = async message => {
  const extractedMessage = await Promise.all([
    extractSerialChangeNumber(message),
    extractPdsId(message)
  ]).catch(err => console.log(err));
  return extractedMessage
    ? {
        serialChangeNumber: extractedMessage[0],
        patientPdsId: extractedMessage[1]
      }
    : {};
};
