import handleMessage from './message-handler';
import fileSave from '../storage/file-system';
import config from '../config';
import s3Save from '../storage/s3';
import * as mhsGateway from './mhs-gateway';
import * as mhsGatewayFake from './mhs-gateway-fake';
import { generateContinueRequest } from '../templates/continue-template';

jest.mock('../storage/file-system', () => jest.fn().mockResolvedValue());
jest.mock('../storage/s3', () => jest.fn().mockResolvedValue());
jest.mock('./mhs-gateway', () => ({ sendMessage: jest.fn().mockResolvedValue() }));
jest.mock('./mhs-gateway-fake', () => ({ sendMessage: jest.fn().mockResolvedValue() }));
jest.mock('uuid/v4', () => () => 'some-uuid');
jest.mock('moment', () => () => ({ format: () => '20190228112548' }));

describe('handleMessage', () => {
  const conversationId = 'some-conversation-id-123';
  const messageId = 'some-message-id-456';
  const foundationSupplierAsid = 'foundation-supplier-asid';
  const ehrRequestCompletedMessage = `
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
            <id extension="${foundationSupplierAsid}" root="1.2.826.0.1285.0.2.0.107"/>
        </device>
    </communicationFunctionSnd>
  </RCMR_IN030000UK06>
    `;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should store the message in local storage if environment is local', () => {
    config.isLocal = true;

    return handleMessage(ehrRequestCompletedMessage).then(() => {
      expect(fileSave).toHaveBeenCalledWith(ehrRequestCompletedMessage, conversationId, messageId);
    });
  });

  it('should store the message in s3 if environment is not local', () => {
    config.isLocal = false;

    return handleMessage(ehrRequestCompletedMessage).then(() => {
      expect(s3Save).toHaveBeenCalledWith(ehrRequestCompletedMessage, conversationId, messageId);
    });
  });

  it('should send generated continue request to real MHS if message is EHR Request Completed and environment is PTL', () => {
    config.isPTL = true;

    return handleMessage(ehrRequestCompletedMessage).then(() => {
      const continueMessage = generateContinueRequest(
        'some-uuid',
        '20190228112548',
        foundationSupplierAsid,
        config.deductionsAsid,
        messageId
      );
      expect(mhsGateway.sendMessage).toHaveBeenCalledWith(continueMessage);
    });
  });

  it('should send generated continue request to fake MHS if message is EHR Request Completed and environment is not PTL', () => {
    config.isPTL = false;

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
      expect(mhsGateway.sendMessage).not.toHaveBeenCalled();
    });
  });
});
