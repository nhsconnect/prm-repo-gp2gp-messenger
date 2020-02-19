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

  it('should throw error for level one nested input objects', () => {
    expect(() => checkTemplateArguments({ patient: { arg1: undefined } })).toThrowError(
      Error('arg1 is undefined')
    );
  });

  it('should throw error for level one nested input objects', () => {
    expect(() => checkTemplateArguments({ patient: { arg1: 'string' } })).not.toThrowError();
  });

  it('will throw error when max depth has been reached', () => {
    expect(() => checkTemplateArguments({ patient: { arg1: 'string' } }, 0)).toThrowError(
      Error('maxDepth reached, exiting')
    );
  });

  it('will not throw error when nested object is within max depth', () => {
    expect(() => checkTemplateArguments({ patient: { arg1: 'string' } }, 2)).not.toThrowError(
      Error('maxDepth reached, exiting')
    );
  });
});
