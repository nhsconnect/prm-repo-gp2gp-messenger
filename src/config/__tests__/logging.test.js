import { obfuscateSecrets } from '../logging';

describe('logging', () => {
  const messageSymbol = Symbol('message');
  const obfuscatedString = '********';

  const testObjectWithPasscode = {
    message: `some-message`,
    data: 'secret-payload',
    error: {
      port: 61614,
      connectArgs: {
        ssl: true,
        connectHeaders: {
          login: 'abcdefg',
          passcode: '1234567'
        }
      }
    },
    [messageSymbol]: 'some-symbol-message'
  };

  describe('obfuscateSecrets', () => {
    it('should replace secret values with obfuscated value', () => {
      const obfuscatedObject = testObjectWithPasscode;
      obfuscatedObject.data = obfuscatedString;
      obfuscatedObject.error.connectArgs.connectHeaders.passcode = obfuscatedString;

      expect(obfuscateSecrets().transform(testObjectWithPasscode)).toEqual(obfuscatedObject);
    });
  });
});
