const checkTemplateArguments = inputObject => {
  if (typeof inputObject !== 'object') {
    throw new Error('input object is not an object');
  }

  Object.keys(inputObject).forEach(key => {
    if (inputObject[key] === undefined) {
      throw new Error(`${key} is undefined`);
    }
  });
};

module.exports = checkTemplateArguments;
