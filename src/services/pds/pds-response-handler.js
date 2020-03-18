import { extractPdsId } from '../parser/pds/extract-pds-id';
import { extractSerialChangeNumber } from '../parser/pds/extract-serial-change-number';

export const handlePdsResponse = async message => {
  const [serialChangeNumber, patientPdsId] = await Promise.all([
    extractSerialChangeNumber(message),
    extractPdsId(message)
  ]);
  return {
    serialChangeNumber,
    patientPdsId
  };
};
