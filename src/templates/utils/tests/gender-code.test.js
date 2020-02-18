const genderCode = require('../gender-code');

describe('genderCode function', () => {
  it(`should return '1' when gender is 'MALE'`, () => {
    expect(genderCode('MALE')).toBe('1');
  });

  it(`should return '2' when gender is 'FEMALE'`, () => {
    expect(genderCode('FEMALE')).toBe('2');
  });

  it(`should return '2' when gender is 'female' (case insensitive)`, () => {
    expect(genderCode('female')).toBe('2');
  });

  it(`should return '0' when gender is 'not known'`, () => {
    expect(genderCode('not known')).toBe('0');
  });

  it(`should return '9' when gender is 'not specified'`, () => {
    expect(genderCode('not specified')).toBe('9');
  });

  it(`should return '0' when no gender is specified`, () => {
    expect(genderCode()).toBe('0');
  });
});
