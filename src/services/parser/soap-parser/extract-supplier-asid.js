export const extractFoundationSupplierAsid = message => {
  const matches = message.match(
    /<communicationFunctionSnd[\s\S]*?extension="(.*?)"[\s\S]*<\/communicationFunctionSnd>/
  );
  if (!matches) {
    throw new Error('Message does not contain foundation supplier ASID');
  }
  return matches[1];
};
