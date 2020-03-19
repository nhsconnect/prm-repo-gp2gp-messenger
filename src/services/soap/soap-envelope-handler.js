import {
  extractAction,
  extractConversationId,
  extractManifestAsMessageIds,
  extractMessageId
} from '../parser/soap';

export const soapEnvelopeHandler = async message => {
  const [conversationId, manifest, messageId, action] = await Promise.all([
    extractConversationId(message),
    extractManifestAsMessageIds(message),
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
