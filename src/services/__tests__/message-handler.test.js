import config from '../../config';
import { updateLogEvent } from '../../middleware/logging';
import { generateContinueRequest } from '../../templates/continue-template';
import { storeMessageInEhrRepo } from '../gp2gp/store-message-in-ehr-repo';
import handleMessage from '../message-handler';
import * as mhsGatewayFake from '../mhs/mhs-old-queue-test-helper';
import {
  conversationId,
  ehrNotCompletedMessage,
  ehrRequestCompletedMessage,
  foundationSupplierAsid,
  messageId,
  messageWithoutAction,
  messageWithoutConversationId,
  messageWithoutMessageId,
  negativeAcknowledgement
} from './data/message-handler';

jest.mock('../mhs/mhs-old-queue-test-helper');
jest.mock('../../middleware/logging');
jest.mock('../gp2gp/store-message-in-ehr-repo');

describe('handleMessage', () => {
  beforeEach(() => {
    mhsGatewayFake.sendMessage.mockResolvedValue();
  });

  it('should call storeMessageInEhrRepo with message, conversationId and messageId', () => {
    return handleMessage(ehrRequestCompletedMessage).then(() => {
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        ehrRequestCompletedMessage,
        expect.objectContaining({
          conversationId,
          messageId
        })
      );
    });
  });

  it('should call storeMessageInEhrRepo with message and manifest (array of messageIds)', () => {
    const manifest = ['FE6A40B9-F4C6-4041-A306-EA2A149411CD'];
    return handleMessage(ehrRequestCompletedMessage).then(() => {
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        ehrRequestCompletedMessage,
        expect.objectContaining({
          manifest
        })
      );
    });
  });

  it('should update the log event at each stage', () => {
    return handleMessage(ehrRequestCompletedMessage).then(() => {
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
    });
  });

  it('should send generated continue request to fake MHS if message is EHR Request Completed and environment is not PTL', async done => {
    await handleMessage(ehrRequestCompletedMessage);
    const continueMessage = generateContinueRequest(
      'mocked-uuid',
      '20190228112548',
      foundationSupplierAsid,
      config.deductionsAsid,
      messageId
    );
    expect(mhsGatewayFake.sendMessage).toHaveBeenCalledWith(continueMessage);
    done();
  });

  it('should not send continue request if message is not EHR Request Completed', async done => {
    await handleMessage(ehrNotCompletedMessage);
    expect(mhsGatewayFake.sendMessage).not.toHaveBeenCalled();
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
});
