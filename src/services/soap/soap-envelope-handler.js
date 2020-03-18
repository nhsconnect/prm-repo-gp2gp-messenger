import {
  extractAction,
  extractConversationId,
  extractManifestInfo,
  extractMessageId
} from '../parser/soap';

export const soapEnvelopeHandler = async message => {
  const [conversationId, manifest, messageId, action] = await Promise.all([
    extractConversationId(message),
    extractManifestInfo(message),
    extractMessageId(message),
    extractAction(message)
  ]);
  return {
    conversationId,
    manifest,
    messageId,
    action
  };
};
