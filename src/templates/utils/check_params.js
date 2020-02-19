const checkTemplateArguments = (inputObject, maxDepth = 10) => {
  if (maxDepth-- === 0) {
    throw new Error('maxDepth reached, exiting');
  }

  if (typeof inputObject !== 'object') {
    throw new Error('input object is not an object');
  }

  Object.keys(inputObject).forEach(key => {
    if (inputObject[key] === undefined) {
      throw new Error(`${key} is undefined`);
    }
    if (typeof inputObject[key] === 'object') {
      checkTemplateArguments(inputObject[key], maxDepth);
    }
  });
};

module.exports = checkTemplateArguments;
