import { parsePdsResponse } from './';

const PDS_RETRIEVAL_QUERY_RESPONSE = 'QUPA_IN000010UK02';

class PDSRetrievalQueryResponse {
  constructor() {
    this.name = 'PDS Retrieval Query Response';
    this.interactionId = PDS_RETRIEVAL_QUERY_RESPONSE;
  }

  handleMessage(message) {
    return parsePdsResponse(message);
  }
}

export { PDSRetrievalQueryResponse, PDS_RETRIEVAL_QUERY_RESPONSE };
