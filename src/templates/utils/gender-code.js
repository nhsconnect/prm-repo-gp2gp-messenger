const genderCode = gender => {
  if (!gender) return '0';
  switch (gender.toLowerCase()) {
    case 'female':
      return '2';
    case 'male':
      return '1';
    case 'not specified':
      return '9';
    default:
      return '0';
  }
};

module.exports = genderCode;
