import nock from 'nock';

export const EhrMessageType = {
  core: 'core',
  fragment: 'fragment'
};

//   { messageType: 'core', interactionId: 'RCMR_IN030000UK06' },
//   { messageType: 'fragment', interactionId: 'COPC_IN000001UK01' }
// }
export const isSmallerThan256KB = jsObject => {
  return JSON.stringify(jsObject).length < 256 * 1024;
};

export const buildPostRequestBody = (
  messageType,
  ehrMessage,
  { conversationId, messageId, destOdsCode, ehrRequestId }
) => {
  switch (messageType) {
    case EhrMessageType.core:
      return {
        conversationId,
        messageId,
        odsCode: destOdsCode,
        coreEhr: ehrMessage,
        ehrRequestId
      };
    case EhrMessageType.fragment:
      return {
        conversationId,
        messageId,
        odsCode: destOdsCode,
        fragmentMessage: ehrMessage
      };
    default:
      throw new TypeError('messageType should be either core or fragment.');
  }
};

export const createMockFhirScope = ({ sdsFhirUrl, destAsidCode }) => {
  const mockFhirResponse = {
    entry: [
      {
        resource: {
          identifier: [
            {
              system: 'https://fhir.nhs.uk/Id/nhsSpineASID',
              value: destAsidCode
            }
          ]
        }
      }
    ]
  };

  return nock(sdsFhirUrl, {
    reqheaders: {
      apiKey: 'fake-sds-api-key'
    }
  })
    .get(`/Device`)
    .query(() => true)
    .reply(200, mockFhirResponse);
};
