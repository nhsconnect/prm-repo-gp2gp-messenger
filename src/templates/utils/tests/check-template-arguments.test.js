const checkTemplateArguments = require('../check_params');

describe('checkTemplateArguments', () => {
  it('should throw error when input argument is undefined', () => {
    expect(() => checkTemplateArguments({ arg1: undefined })).toThrowError(
      Error('arg1 is undefined')
    );
  });

  it('should not throw error when input argument is defined', () => {
    expect(() => checkTemplateArguments({ arg1: 'something' })).not.toThrowError();
  });

  it('should throw error when input object is not of type object', () => {
    expect(() => checkTemplateArguments('string')).toThrowError(
      Error('input object is not an object')
    );
  });

  it('should throw error when input object is undefined', () => {
    expect(() => checkTemplateArguments()).toThrowError(Error('input object is not an object'));
  });
});
