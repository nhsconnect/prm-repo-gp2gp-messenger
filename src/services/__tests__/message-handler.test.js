import config from '../../config';
import { updateLogEvent } from '../../middleware/logging';
import { generateContinueRequest } from '../../templates/continue-template';
import { storeMessageInEhrRepo } from '../ehr-repo-gateway';
import handleMessage from '../message-handler';
import * as mhsGatewayFake from '../mhs/mhs-old-queue-test-helper';

jest.mock('../mhs/mhs-old-queue-test-helper');
jest.mock('uuid/v4', () => () => 'some-uuid');
jest.mock('moment', () => () => ({ format: () => '20190228112548' }));
jest.mock('../../middleware/logging');
jest.mock('../ehr-repo-gateway');

describe('handleMessage', () => {
  const conversationId = 'some-conversation-id-123';
  const messageId = 'some-message-id-456';
  const foundationSupplierAsid = 'foundation-supplier-asid';
  const ehrRequestCompletedMessage = `<SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:ConversationId>${conversationId}</eb:ConversationId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:Action>RCMR_IN030000UK06</eb:Action>
        <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>
   ------=_Part_33_26096504.1528792157887
  Content-Type: application/xml
  Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
  Content-Transfer-Encoding: 8bit
  <RCMR_IN030000UK06>
    <id root="${messageId}"/>
    <communicationFunctionRcv typeCode="RCV">
    <interactionId extension="RCMR_IN030000UK06" root="2.16.840.1.113883.2.1.3.2.4.12"/>
        <device classCode="DEV" determinerCode="INSTANCE">
            <id extension="${config.deductionsAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </device>
    </communicationFunctionRcv>
    <communicationFunctionSnd typeCode="SND">
        <device classCode="DEV" determinerCode="INSTANCE">
            <id extension="${foundationSupplierAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </device>
    </communicationFunctionSnd>
  </RCMR_IN030000UK06>
    `;

  beforeEach(() => {
    mhsGatewayFake.sendMessage.mockResolvedValue();
  });

  it('should store the message in the ehr repo', () => {
    return handleMessage(ehrRequestCompletedMessage).then(() => {
      expect(storeMessageInEhrRepo).toHaveBeenCalledWith(
        ehrRequestCompletedMessage,
        conversationId,
        messageId
      );
    });
  });

  it('should update the log event at each stage', () => {
    return handleMessage(ehrRequestCompletedMessage).then(() => {
      expect(updateLogEvent).toHaveBeenCalledWith({ status: 'handling-message' });
      expect(updateLogEvent).toHaveBeenCalledWith({
        message: {
          conversationId,
          messageId,
          action: 'RCMR_IN030000UK06',
          isNegativeAcknowledgement: false
        }
      });
    });
  });

  it('should send generated continue request to fake MHS if message is EHR Request Completed and environment is not PTL', () => {
    return handleMessage(ehrRequestCompletedMessage).then(() => {
      const continueMessage = generateContinueRequest(
        'some-uuid',
        '20190228112548',
        foundationSupplierAsid,
        config.deductionsAsid,
        messageId
      );
      expect(mhsGatewayFake.sendMessage).toHaveBeenCalledWith(continueMessage);
    });
  });

  it('should not send continue request if message is not EHR Request Completed', () => {
    const fragmentMessage = `
    <SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:ConversationId>${conversationId}</eb:ConversationId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:Action>COPC_IN000001UK01</eb:Action>
        <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;

    return handleMessage(fragmentMessage).then(() => {
      expect(mhsGatewayFake.sendMessage).not.toHaveBeenCalled();
    });
  });

  it('should reject the promise if message does not contain a conversation id', () => {
    const messageWithoutConversationId = `
    <SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:Action>COPC_IN000001UK01</eb:Action>
        <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;

    return expect(handleMessage(messageWithoutConversationId)).rejects.toEqual(
      new Error(
        `Can’t process the EHR fragment successfully - missing conversation id or interaction id or message id`
      )
    );
  });

  it('should reject the promise if message does not contain a message id', () => {
    const messageWithoutMessageId = `
    <SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:ConversationId>${conversationId}</eb:ConversationId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:Action>COPC_IN000001UK01</eb:Action>
        <eb:MessageData>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;

    return expect(handleMessage(messageWithoutMessageId)).rejects.toEqual(
      new Error(
        'Can’t process the EHR fragment successfully - missing conversation id or interaction id or message id'
      )
    );
  });

  it('should reject the promise if message does not contain a action', () => {
    const messageWithoutAction = `
    <SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:ConversationId>${conversationId}</eb:ConversationId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;

    return expect(handleMessage(messageWithoutAction)).rejects.toEqual(
      new Error('Message does not contain action')
    );
  });

  it('should reject the promise if message does not contain foundation supplier asid', () => {
    const messageWithoutFoundationSupplierAsid = `
    <SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:ConversationId>${conversationId}</eb:ConversationId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:Action>RCMR_IN030000UK06</eb:Action>
        <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>
   ------=_Part_33_26096504.1528792157887
  Content-Type: application/xml
  Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
  Content-Transfer-Encoding: 8bit
  <RCMR_IN030000UK06>
    <id root="${messageId}"/>
    <communicationFunctionRcv typeCode="RCV">
        <device classCode="DEV" determinerCode="INSTANCE">
            <id extension="${config.deductionsAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </device>
    </communicationFunctionRcv>
    <communicationFunctionSnd typeCode="SND">
        <device classCode="DEV" determinerCode="INSTANCE">
        </device>
    </communicationFunctionSnd>
  </RCMR_IN030000UK06>`;

    return expect(handleMessage(messageWithoutFoundationSupplierAsid)).rejects.toEqual(
      new Error('Message does not contain foundation supplier ASID')
    );
  });

  it('should reject the promise if message is negative acknowledgement', () => {
    const negativeAcknowledgement = `
    <SOAP-ENV:Envelope>
      <SOAP-ENV:Header>
        <eb:CPAId>S2036482A2160104</eb:CPAId>
        <eb:ConversationId>${conversationId}</eb:ConversationId>
        <eb:Service>urn:nhs:names:services:gp2gp</eb:Service>
        <eb:Action>MCCI_IN010000UK13</eb:Action>
        <eb:MessageData>
            <eb:MessageId>${messageId}</eb:MessageId>
            <eb:Timestamp>2018-06-12T08:29:16Z</eb:Timestamp>
        </eb:MessageData>
      </SOAP-ENV:Header>
      <SOAP-ENV:Body>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>
   ------=_Part_33_26096504.1528792157887
  Content-Type: application/xml
  Content-ID: <50D33D75-04C6-40AF-947D-E6E9656C1EEB@inps.co.uk/Vision/3>
  Content-Transfer-Encoding: 8bit
  <MCCI_IN010000UK13>
    <eb:id root="${messageId}"/>
    <eb:acknowledgement typeCode="AR">
        <eb:acknowledgementDetail typeCode="ER">
            <eb:code codeSystem="2.16.840.1.113883.2.1.3.2.4.17.32" code="519"
                  displayName="hl7:{interactionId}/hl7:communicationFunctionRcv/hl7:device/hl7:id[@root=2.16.840.1.113883.2.1.3.2.4.10] is not [1..1], or is inconsistent with the SOAP:Header"/>
        </eb:acknowledgementDetail>
        <eb:messageRef>
            <eb:id root="kjhidsfg-fdgdfg-dfgdg"/>
        </eb:messageRef>
    </eb:acknowledgement>
    <eb:communicationFunctionRcv typeCode="RCV">
        <eb:device classCode="DEV" determinerCode="INSTANCE">
            <eb:id extension="${config.deductionsAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </eb:device>
    </eb:communicationFunctionRcv>
    <eb:communicationFunctionSnd typeCode="SND">
        <eb:device classCode="DEV" determinerCode="INSTANCE">
            <eb:id extension="${foundationSupplierAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </eb:device>
    </eb:communicationFunctionSnd>
  </MCCI_IN010000UK13>`;

    return expect(handleMessage(negativeAcknowledgement)).rejects.toEqual(
      new Error('Message is a negative acknowledgement')
    );
  });
});
