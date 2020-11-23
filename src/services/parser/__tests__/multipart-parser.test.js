import { parseMultipartBody } from '../multipart-parser';

const testBody = `<body xmlns:xsi="http://www.w3c.org/2001/XML-Schema-Instance">something</body>`;
const contentId = `<ebXMLHeader@spine.nhs.uk>`;
const contentType = `text/xml`;
const contentTransferEncoding = `8bit`;
const authorization = 'Basic 123';
const emptyMultipartMessage = ``;

const uuidBoundaryMessage = `
--e01d9133-5058-45e5-a884-9189f468c805

--e01d9133-5058-45e5-a884-9189f468c805--`;

const mimeBoundaryMultipartMessage = `
----=_MIME-Boundary

----=_MIME-Boundary--
`;

const messageHasNoBody = `
----=_MIME-Boundary
Content-Id: ${contentId}
Content-Type: ${contentType}
Content-Transfer-Encoding: ${contentTransferEncoding}

----=_MIME-Boundary--
`;

const messageHasNoHeader = `
----=_MIME-Boundary
${testBody}

----=_MIME-Boundary--
`;

const messageHeaderWithAdditionalWhitespace = `
----=_MIME-Boundary
Content-Id:   ${contentId}

----=_MIME-Boundary--
`;

const messageHeaderWithWhitespaceInValue = `
----=_MIME-Boundary
Authorization: ${authorization}

----=_MIME-Boundary--
`;

const stringBodyMultipartMessage = `     some string        `;

const oneObjectMultipartMessage = `
----=_MIME-Boundary
Content-Id: ${contentId}

${testBody}

----=_MIME-Boundary--
`;

const oneObjectTwoLineBody = `
----=_MIME-Boundary
Content-Id: ${contentId}

${testBody}
${testBody}

----=_MIME-Boundary--
`;

const manyObjectsPathMultipartMessage = `----=_MIME-Boundary
Content-Id: ${contentId}
Content-Type: ${contentType}
Content-Transfer-Encoding: ${contentTransferEncoding}

${testBody}

----=_MIME-Boundary
Content-Id: <ebXMLHeader@spine.nhs.uk>
Content-Type: text/xml
Content-Transfer-Encoding: 8bit

${testBody}

----=_MIME-Boundary
Content-Id: <ebXMLHeader@spine.nhs.uk>
Content-Type: text/xml
Content-Transfer-Encoding: 8bit

${testBody}

----=_MIME-Boundary--
`;

const manyObjectsPathMultipartMessageWithUuidBoundary = `--e01d9133-5058-45e5-a884-9189f468c805
Content-Id: ${contentId}
Content-Type: ${contentType}
Content-Transfer-Encoding: ${contentTransferEncoding}

${testBody}

--e01d9133-5058-45e5-a884-9189f468c805
Content-Id: <ebXMLHeader@spine.nhs.uk>
Content-Type: text/xml
Content-Transfer-Encoding: 8bit

${testBody}

--e01d9133-5058-45e5-a884-9189f468c805
Content-Id: <ebXMLHeader@spine.nhs.uk>
Content-Type: text/xml
Content-Transfer-Encoding: 8bit

${testBody}

--e01d9133-5058-45e5-a884-9189f468c805--
`;

const randomPrefixString = `
fjdsaou4npjwae${manyObjectsPathMultipartMessage}`;

const noEofBoundaryMultipartMessage = `
----=_MIME-Boundary
Content-Id: <ebXMLHeader@spine.nhs.uk>

${testBody}`;

const message1 = {
  headers: {
    'Content-Id': contentId,
    'Content-Type': contentType,
    'Content-Transfer-Encoding': contentTransferEncoding
  },
  body: ''
};

const multipartMessageOutput = [
  {
    headers: {
      'Content-Id': contentId,
      'Content-Type': contentType,
      'Content-Transfer-Encoding': contentTransferEncoding
    },
    body: testBody
  },
  {
    headers: {
      'Content-Id': contentId,
      'Content-Type': contentType,
      'Content-Transfer-Encoding': contentTransferEncoding
    },
    body: testBody
  },
  {
    headers: {
      'Content-Id': contentId,
      'Content-Type': contentType,
      'Content-Transfer-Encoding': contentTransferEncoding
    },
    body: testBody
  }
];

describe('MultipartParser', () => {
  describe('parseMultipartBody', () => {
    it('should return empty array if the message is empty ', () => {
      expect(parseMultipartBody(emptyMultipartMessage)).toEqual([]);
    });

    it('should return an array with empty object if the message only have boundary', () => {
      expect(parseMultipartBody(mimeBoundaryMultipartMessage)).toEqual([
        {
          body: '',
          headers: {}
        }
      ]);
    });

    it('should return object with header and empty body if message body is empty', () => {
      expect(parseMultipartBody(messageHasNoBody)).toEqual([message1]);
    });
    // it('should return object with header and body', () => {
    //   expect(parseMultipartBody(oneObjectMultipartMessage)).toEqual([message2]);
    // });
    it('should return empty array if there is no boundary in message', () => {
      expect(parseMultipartBody(stringBodyMultipartMessage)).toEqual([]);
    });

    it('should trim header value if message header value has space in prefix ', () => {
      expect(parseMultipartBody(messageHeaderWithAdditionalWhitespace)).toEqual([
        {
          headers: {
            'Content-Id': contentId
          },
          body: ''
        }
      ]);
    });
    it('should not remove whitespace in the middle of header value', () => {
      expect(parseMultipartBody(messageHeaderWithWhitespaceInValue)).toEqual([
        {
          headers: {
            Authorization: authorization
          },
          body: ''
        }
      ]);
    });

    it('should get body from message', () => {
      expect(parseMultipartBody(oneObjectMultipartMessage)).toEqual([
        {
          headers: {
            'Content-Id': contentId
          },
          body: testBody
        }
      ]);
    });

    it('should return object with header and body if the message have many parts', () => {
      expect(parseMultipartBody(manyObjectsPathMultipartMessage)).toEqual(multipartMessageOutput);
    });

    it('should return object with header and body if the message is prefixed with random characters', () => {
      expect(parseMultipartBody(randomPrefixString)).toEqual(multipartMessageOutput);
    });

    it('should return object with empty header if the message has not header ', () => {
      expect(parseMultipartBody(messageHasNoHeader)).toEqual([
        {
          headers: {},
          body: testBody
        }
      ]);
    });

    it('should return object with header and body if the end boundary is missing', () => {
      expect(parseMultipartBody(noEofBoundaryMultipartMessage)).toEqual([
        {
          headers: {
            'Content-Id': contentId
          },
          body: testBody
        }
      ]);
    });

    it('should return one object including both of the lines for the body', () => {
      expect(parseMultipartBody(oneObjectTwoLineBody)).toEqual([
        {
          headers: {
            'Content-Id': contentId
          },
          body: [testBody, testBody].join('')
        }
      ]);
    });

    it('should return an empty body and header for message with uuid boundary and no content', () => {
      expect(parseMultipartBody(uuidBoundaryMessage)).toEqual([
        {
          body: '',
          headers: {}
        }
      ]);
    });

    it('should return all objects when multipart message has uuid boundary', () => {
      expect(parseMultipartBody(manyObjectsPathMultipartMessageWithUuidBoundary)).toEqual(
        multipartMessageOutput
      );
    });
  });
});
