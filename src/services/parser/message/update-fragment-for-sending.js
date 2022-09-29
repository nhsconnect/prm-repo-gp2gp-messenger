/* eslint-disable no-unused-vars*/
import { initializeConfig } from '../../../config';
import * as xml2js from 'xml2js';
import { Builder } from 'xml2js';

export async function updateFragmentForSending(
  fragmentPayload,
  messageId,
  recipientAsid,
  recipientOdsCode
) {
  const config = initializeConfig();
  const sendingAsid = config.deductionsAsid;
  const sendingOdsCode = config.deductionsOdsCode;

  const payloadXml = await new xml2js.Parser({ explicitArray: false }).parseStringPromise(
    fragmentPayload
  );
  const copcUK01 = payloadXml.COPC_IN000001UK01;
  copcUK01.communicationFunctionRcv.device = updateId(
    copcUK01.communicationFunctionRcv.device,
    recipientAsid
  );
  copcUK01.communicationFunctionSnd.device = updateId(
    copcUK01.communicationFunctionSnd.device,
    sendingAsid
  );
  copcUK01.id['$'].root = messageId;

  let payloadInformation = copcUK01.ControlActEvent.subject.PayloadInformation;
  payloadInformation.id['$'].root = messageId;
  payloadInformation.pertinentInformation.pertinentPayloadBody.id['$'].root = messageId;

  let gp2gpfragment = payloadInformation.value.Gp2gpfragment;
  gp2gpfragment['message-id'] = messageId;
  gp2gpfragment.From = sendingOdsCode;
  gp2gpfragment.Recipients.Recipient = recipientOdsCode;

  const builder = new Builder();
  return builder.buildObject(payloadXml);
}

const updateId = (field, newId) => {
  field.id['$'].extension = newId;
  return field;
};
