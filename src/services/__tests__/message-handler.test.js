import { updateLogEvent } from '../../middleware/logging';
import { EHRRequestCompleted } from '../gp2gp/ehr-request-completed';
import handleMessage from '../message-handler';
import { PDSGeneralUpdateRequestAccepted } from '../pds/pds-general-update-request-accepted';
import {
  conversationId,
  ehrRequestCompletedMessage,
  messageId,
  messageWithoutAction,
  messageWithoutConversationId,
  messageWithoutMessageId,
  negativeAcknowledgement,
  pdsGeneralUpdateRequestAcceptedMessage,
  unhandledInteractionId
} from './data/message-handler';

jest.mock('../../middleware/logging');
jest.mock('../gp2gp/store-message-in-ehr-repo');
jest.mock('../gp2gp/ehr-request-completed');
jest.mock('../pds/pds-general-update-request-accepted');

describe('handleMessage', () => {
  beforeEach(() => {
    EHRRequestCompleted.prototype.handleMessage = jest
      .fn()
      .mockImplementation(() => 'EHRRequestCompleted handled message');

    PDSGeneralUpdateRequestAccepted.prototype.handleMessage = jest
      .fn()
      .mockImplementation(() => 'PDSGeneralUpdateRequestAccepted handled message');
  });

  it('should update the log event at each stage', async done => {
    await handleMessage(ehrRequestCompletedMessage);
    expect(updateLogEvent).toHaveBeenCalledWith({ status: 'handling-message' });
    expect(updateLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          conversationId,
          messageId,
          action: 'RCMR_IN030000UK06',
          isNegativeAcknowledgement: false
        })
      })
    );
    done();
  });

  it('should reject the promise if message does not contain a conversation id', () => {
    return expect(handleMessage(messageWithoutConversationId)).rejects.toEqual(
      new Error(`The key 'ConversationId' was not found in the message`)
    );
  });

  it('should reject the promise if message does not contain a message id', () => {
    return expect(handleMessage(messageWithoutMessageId)).rejects.toEqual(
      new Error(`The key 'MessageId' was not found in the message`)
    );
  });

  it('should reject the promise if message does not contain a action', () => {
    return expect(handleMessage(messageWithoutAction)).rejects.toEqual(
      new Error('Message does not contain action')
    );
  });

  it('should reject the promise if message is negative acknowledgement', () => {
    return expect(handleMessage(negativeAcknowledgement)).rejects.toEqual(
      new Error('Message is a negative acknowledgement')
    );
  });

  it('should reject the promise if the message action does not have a handler implemented', () => {
    const interactionId = 'FAKE_IN030000UK06';
    return expect(handleMessage(unhandledInteractionId)).rejects.toEqual(
      new Error(`Message Handler not implemented for ${interactionId}`)
    );
  });

  it('should call EHRRequestCompleted with the message if message is type RCMR_IN030000UK06', async done => {
    await handleMessage(ehrRequestCompletedMessage);
    expect(EHRRequestCompleted.prototype.handleMessage).toHaveBeenCalledTimes(1);
    expect(EHRRequestCompleted.prototype.handleMessage).toHaveBeenCalledWith(
      ehrRequestCompletedMessage
    );
    done();
  });

  it('should call PDSGeneralUpdateRequestAccepted with the message if message is type ', async done => {
    await handleMessage(pdsGeneralUpdateRequestAcceptedMessage);
    expect(PDSGeneralUpdateRequestAccepted.prototype.handleMessage).toHaveBeenCalledTimes(1);
    expect(PDSGeneralUpdateRequestAccepted.prototype.handleMessage).toHaveBeenCalledWith(
      pdsGeneralUpdateRequestAcceptedMessage
    );
    done();
  });
});
