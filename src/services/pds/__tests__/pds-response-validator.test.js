import { validatePdsResponse } from '../pds-response-validator';

describe('validatePdsResponse', () => {
  const pdsResponseAE = `
            <QUQI_IN010000UK14>
                <id root="DC50384E-5E2A-11EA-A673-F40343488B16"/>
                <creationTime value="20200304151436"/>
                <versionCode code="3NPfIT6.3.01"/>
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="QUQI_IN010000UK14"/> 
                <acceptAckCode code="NE"/>
                <acknowledgement typeCode="AE"/>
             </QUQI_IN010000UK14>
    `;

  const pdsResponseAA = `
            <QUPA_IN000009UK03>
                <id root="DC50384E-5E2A-11EA-A673-F40343488B16"/>
                <creationTime value="20200304151436"/>
                <versionCode code="3NPfIT6.3.01"/>
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="QUPA_IN000009UK03"/> 
                <acceptAckCode code="NE"/>
                <acknowledgement typeCode="AE"/>
             </QUPA_IN000009UK03>
    `;

  const pdsResponseEmptyString = `
    `;

  it('should return false if the pds response is NACK', () => {
    return validatePdsResponse(pdsResponseAE).then(res => expect(res).toBe(false));
  });

  it('should return true if the pds response is ACK', () => {
    return validatePdsResponse(pdsResponseAA).then(res => expect(res).toBe(true));
  });

  it('should catch error when there is any failure to validate the response', () => {
    return validatePdsResponse(pdsResponseEmptyString).catch(err =>
      expect(err.message).toEqual('failed to validate the response body')
    );
  });
});
