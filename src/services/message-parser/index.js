import { extractConversationId } from './extract-conversation-id';
import { extractMessageId } from './extract-message-id';
import { extractFoundationSupplierAsid } from './extract-supplier-asid';
import { extractAction } from './extract-action';
import { extractInteractionId } from './extract-interaction-id';
import { containsNegativeAcknowledgement } from './contains-negative-acknowledgement';

export const EHR_EXTRACT_MESSAGE_ACTION = 'RCMR_IN030000UK06';
export const EHR_REQUEST_MESSAGE_ACTION = 'RCMR_IN010000UK05';
export const CONTINUE_MESSAGE_ACTION = 'COPC_IN000001UK01';

export { extractConversationId };
export { extractMessageId };
export { extractFoundationSupplierAsid };
export { extractAction };
export { extractInteractionId };
export { containsNegativeAcknowledgement };
