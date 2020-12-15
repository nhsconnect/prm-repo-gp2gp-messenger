const boundaryMatcher = /^.*(--=_MIME-Boundary)|(--[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/gm;

// Extracts key value pair based on {Key} : OWS {Value} OWS
// Where the key include alpha characters and hyphens only
// and the value can include any character.
const headerMatcher = /^([a-zA-Z-]+):[\s]*(.*)[\s]*$/gm;
const keyValuePairMatcher = /^([a-zA-Z-]+):[\s]*(.*)[\s]*$/m;

const newLineMatcher = /^[\n]+$/g;
const bodyMatcher = /^[\s]*(.*)[\s]*$/gm;

const getFullBoundaryText = multipartMessage => {
  const boundaryMatch = multipartMessage.match(boundaryMatcher) || '';

  if (!boundaryMatch) return '';

  return boundaryMatch[0].substring(boundaryMatch[0].indexOf('----') || 0);
};

const extractBoundaryContent = rawMultipartMessage => {
  const fullBoundaryTest = getFullBoundaryText(rawMultipartMessage);

  // Case when boundary does not exist (empty message or string)
  if (!fullBoundaryTest) return [];

  const messageParts = rawMultipartMessage.trim().split(fullBoundaryTest);

  return messageParts[messageParts.length - 1] === '--'
    ? messageParts.slice(1, -1)
    : messageParts.slice(1);
};

const extractHeaders = messagePart => extractKeyValuePairs(messagePart.match(headerMatcher) || []);

const extractKeyValuePairs = headersArray =>
  headersArray.reduce((headerObj, header) => {
    const headerKeyPair = header.match(keyValuePairMatcher);

    headerObj[headerKeyPair[1]] = headerKeyPair[2];
    return headerObj;
  }, {});

const extractBody = messagePart => {
  return messagePart
    .match(bodyMatcher)
    .map(line => (line.match(newLineMatcher) || line.match(keyValuePairMatcher) ? '' : line.trim()))
    .join('');
};

export const parseMultipartBody = multipartMessage =>
  extractBoundaryContent(multipartMessage).map(messagePart => ({
    headers: extractHeaders(messagePart),
    body: extractBody(messagePart)
  }));
