import { parseMultipartBody } from '../';
import {
  asyncGp2gpMessageExample,
  asyncSpineAcknowledgementExample,
  syncSpineAcknowledgementExample
} from './data/multipart-parser';

describe('multipart-parser', () => {
  describe('Synchronous Spine Acknowledgement', () => {
    let parsedAcknowledgement;

    beforeAll(() => {
      parsedAcknowledgement = parseMultipartBody(syncSpineAcknowledgementExample);
    });

    it('should include two results in output', () => {
      expect(parsedAcknowledgement.length).toBe(2);
    });

    it('should have correct Content-Id header in the first result', () => {
      expect('Content-Id' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Id']).toBe('<ebXMLHeader@spine.nhs.uk>');
    });

    it('should have correct Content-Type header in the first result', () => {
      expect('Content-Type' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Type']).toBe('text/xml');
    });

    it('should have correct Content-Transfer-Encoding header in the first result', () => {
      expect('Content-Transfer-Encoding' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Transfer-Encoding']).toBe('8bit');
    });

    it('should have correct Content-Id header in the second result', () => {
      expect('Content-Id' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Id']).toBe(
        '<745E2784-5194-11EA-A5FB-F40343488B16@spine.nhs.uk>'
      );
    });

    it('should have correct Content-Type header in the second result', () => {
      expect('Content-Type' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Type']).toBe('application/xml');
    });

    it('should have correct Content-Transfer-Encoding header in the second result', () => {
      expect('Content-Transfer-Encoding' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Transfer-Encoding']).toBe('8bit');
    });

    it('should have a string body starting with xml header', () => {
      expect(parsedAcknowledgement[0].body).toMatch(
        /^<\?xml version='1\.0' encoding='UTF-8'\?><(.*)$/
      );
    });

    it('should contain the soap envelope in the first result', () => {
      expect(parsedAcknowledgement[0].body).toMatch(/^(.*)<soap:Envelope(.*)<\/soap:Envelope>$/);
    });

    it('should contain the message in the second result', () => {
      expect(parsedAcknowledgement[1].body).toMatch(
        /^(.*)<hl7:MCCI_IN010000UK13(.*)<\/hl7:MCCI_IN010000UK13>$/
      );
    });
  });

  describe('Asynchronous Spine Acknowledgement', () => {
    let parsedAcknowledgement;

    beforeAll(() => {
      parsedAcknowledgement = parseMultipartBody(asyncSpineAcknowledgementExample);
    });

    it('should include two results in output', () => {
      expect(parsedAcknowledgement.length).toBe(2);
    });

    it('should have correct Content-Id header in the first result', () => {
      expect('Content-Id' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Id']).toBe('<ebXMLHeader@spine.nhs.uk>');
    });

    it('should have correct Content-Type header in the first result', () => {
      expect('Content-Type' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Type']).toBe('text/xml');
    });

    it('should have correct Content-Transfer-Encoding header in the first result', () => {
      expect('Content-Transfer-Encoding' in parsedAcknowledgement[0].headers).toBe(true);
      expect(parsedAcknowledgement[0].headers['Content-Transfer-Encoding']).toBe('8bit');
    });

    it('should have correct Content-Id header in the second result', () => {
      expect('Content-Id' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Id']).toBe(
        '<745E2784-5194-11EA-A5FB-F40343488B16@spine.nhs.uk>'
      );
    });

    it('should have correct Content-Type header in the second result', () => {
      expect('Content-Type' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Type']).toBe('application/xml');
    });

    it('should have correct Content-Transfer-Encoding header in the second result', () => {
      expect('Content-Transfer-Encoding' in parsedAcknowledgement[1].headers).toBe(true);
      expect(parsedAcknowledgement[1].headers['Content-Transfer-Encoding']).toBe('8bit');
    });

    it('should have a string body starting with xml header', () => {
      expect(parsedAcknowledgement[0].body).toMatch(
        /^<\?xml version='1\.0' encoding='UTF-8'\?><(.*)$/
      );
    });

    it('should contain the soap envelope in the first result', () => {
      expect(parsedAcknowledgement[0].body).toMatch(/^(.*)<soap:Envelope(.*)<\/soap:Envelope>$/);
    });

    it('should contain the message in the second result', () => {
      expect(parsedAcknowledgement[1].body).toMatch(
        /^(.*)<hl7:MCCI_IN010000UK13(.*)<\/hl7:MCCI_IN010000UK13>$/
      );
    });
  });

  describe('GP2GP Message Example', () => {
    let multipartMessage;

    beforeAll(() => {
      multipartMessage = parseMultipartBody(asyncGp2gpMessageExample);
    });

    it('should have three entries', () => {
      expect(multipartMessage.length).toBe(3);
    });

    it('should have an attachement', () => {
      expect(multipartMessage[2].body).toBe('SGk=');
    });
  });
});
