/* eslint-disable no-unused-vars*/
export function updateFragmentForSending(
  fragmentMessage,
  recipientAsid,
  conversationId,
  messageId
) {
  return fragmentMessage + recipientAsid;
}
