import { fromXml } from './xml-parser';

describe('xml-parser', () => {
  describe('fromXml', () => {
    const standardXml = `
    <root>
        <body>Hello World</body>
    </root>
    `;

    const soapPrefixXml = `
    <SOAP:root>
        <SOAP:body>Hello World</SOAP:body>
    </SOAP:root>
    `;

    const ebPrefixXml = `
    <eb:root>
        <eb:body>Hello World</eb:body>
    </eb:root>
    `;

    const attributeXml = `<some message="Hello World" />`;

    const innerTextXml = `<some thing="this">Hello World</some>`;

    it('should parse standard XML to an Object', () => {
      fromXml(standardXml).then(object => {
        expect(object).not.toBeNull();
        return expect(object.root.body).toBe('Hello World');
      });
    });

    it('should parse SOAP prefix XML to an Object without prefix', () => {
      fromXml(soapPrefixXml).then(object => {
        console.log(object);
        expect(object).not.toBeNull();
        return expect(object.root.body).toBe('Hello World');
      });
    });

    it('should parse eb prefix XML to an Object without prefix', () => {
      fromXml(ebPrefixXml).then(object => {
        expect(object).not.toBeNull();
        return expect(object.root.body).toBe('Hello World');
      });
    });

    it('should parse attributes as part of the object body', () => {
      fromXml(attributeXml).then(object => {
        expect(object).not.toBeNull();
        return expect(object.some.message).toBe('Hello World');
      });
    });

    it('should parse body into object as innerText', () => {
      fromXml(innerTextXml).then(object => {
        expect(object).not.toBeNull();
        expect(object.some.thing).toBe('this');
        return expect(object.some.innerText).toBe('Hello World');
      });
    });
  });
});
