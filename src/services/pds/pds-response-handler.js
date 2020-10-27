import { extractPdsId } from '../parser/pds/extract-pds-id';
import { extractSerialChangeNumber } from '../parser/pds/extract-serial-change-number';
import { extractOdsCode } from '../parser/pds/extract-ods-code';

export const handlePdsResponse = async message => {
  const [serialChangeNumber, patientPdsId, odsCode] = await Promise.all([
    extractSerialChangeNumber(message),
    extractPdsId(message),
    extractOdsCode(message)
  ]);
  return {
    serialChangeNumber,
    patientPdsId,
    odsCode
  };
};
