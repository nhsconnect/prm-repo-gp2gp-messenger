export const jsonEhrExtract = {
  ebXML:
    '<soap:Envelope xmlns:eb="http://www.oasis-open.org/committees/ebxml-msg/schema/msg-header-2_0.xsd" xmlns:hl7ebxml="urn:hl7-org:transport/ebxml/DSTUv1.0" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header><eb:MessageHeader eb:version="2.0" soap:mustUnderstand="1"><eb:From><eb:PartyId eb:type="urn:nhs:names:partyType:ocs+serviceInstance">A91720-9198820</eb:PartyId></eb:From><eb:To><eb:PartyId eb:type="urn:nhs:names:partyType:ocs+serviceInstance">A91368-9199177</eb:PartyId></eb:To><eb:CPAId>e06af803674408a9d8e8</eb:CPAId><eb:ConversationId>f5a43b01-f8a8-45ae-90c5-40ee012dadc9</eb:ConversationId><eb:Service>urn:nhs:names:services:gp2gp</eb:Service><eb:Action>RCMR_IN030000UK06</eb:Action><eb:MessageData><eb:MessageId>1dacd95d-a0fe-4bc2-bf6a-c373a8924198</eb:MessageId><eb:Timestamp>2021-03-09T14:21:22.646Z</eb:Timestamp><eb:TimeToLive>2021-03-09T20:36:22.646Z</eb:TimeToLive></eb:MessageData><eb:DuplicateElimination /></eb:MessageHeader><eb:AckRequested eb:version="2.0" soap:mustUnderstand="1" soap:actor="urn:oasis:names:tc:ebxml-msg:actor:nextMSH" eb:signed="false" /></soap:Header><soap:Body><eb:Manifest eb:version="2.0" soap:mustUnderstand="1"><eb:Reference xlink:href="cid:Content1@e-mis.com/EMISWeb/GP2GP2.2A" xmlns:xlink="http://www.w3.org/1999/xlink"><eb:Description xml:lang="en">RCMR_IN030000UK06</eb:Description><hl7ebxml:Payload style="HL7" encoding="XML" version="3.0" /></eb:Reference><eb:Reference xlink:href="mid:e60a6c7e-6fd8-41c4-aa64-20d8b87dda89" eb:id="_4AB6EDEE-958F-4828-BDA5-B49285A83B3E" xmlns:xlink="http://www.w3.org/1999/xlink"><eb:Description xml:lang="en">Filename="4AB6EDEE-958F-4828-BDA5-B49285A83B3E_sample.bin" ContentType=application/octet-stream Compressed=No LargeAttachment=Yes OriginalBase64=No Length=8388608</eb:Description></eb:Reference></eb:Manifest></soap:Body></soap:Envelope>',
  payload:
    ' <RCMR_IN030000UK06 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="urn:hl7-org:v3"><id root="1dacd95d-a0fe-4bc2-bf6a-c373a8924198" /><creationTime value="20210309142118" /><versionCode code="V3NPfIT3.1.10" /><interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="RCMR_IN030000UK06" /><processingCode code="P" /><processingModeCode code="T" /><acceptAckCode code="NE" /><communicationFunctionRcv typeCode="RCV"><device classCode="DEV" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.2.0.107" extension="200000001161" /></device></communicationFunctionRcv><communicationFunctionSnd typeCode="SND"><device classCode="DEV" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.2.0.107" extension="200000000631" /></device></communicationFunctionSnd><ControlActEvent classCode="CACT" moodCode="EVN"><author1 typeCode="AUT"><AgentSystemSDS classCode="AGNT"><agentSystemSDS classCode="DEV" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.2.0.107" extension="200000000631" /></agentSystemSDS></AgentSystemSDS></author1><subject typeCode="SUBJ" contextConductionInd="false"><EhrExtract classCode="EXTRACT" moodCode="EVN"><id root="5EF68481-F1E8-4C1C-A3D3-3C40F460CBBA" /><statusCode code="COMPLETE" /><availabilityTime value="20210309142118" /><recordTarget typeCode="RCT"><patient classCode="PAT"><id root="2.16.840.1.113883.2.1.4.1" extension="9692842312" /></patient></recordTarget><author typeCode="AUT"><time value="20210309142118" /><signatureCode code="S" /><signatureText>X</signatureText><AgentOrgSDS classCode="AGNT"><agentOrganizationSDS classCode="ORG" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.1.10" extension="A91720" /></agentOrganizationSDS></AgentOrgSDS></author><destination typeCode="DST"><AgentOrgSDS classCode="AGNT"><agentOrganizationSDS classCode="ORG" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.1.10" extension="B86041" /></agentOrganizationSDS></AgentOrgSDS></destination><component typeCode="COMP"><ehrFolder classCode="FOLDER" moodCode="EVN"><id root="0405EC09-657A-406C-ACB5-3D7EDAD0A9B9" /><statusCode code="COMPLETE" /><effectiveTime><low value="20210309" /><high value="20210309142118" /></effectiveTime><availabilityTime value="20210309142118" /><author typeCode="AUT"><time value="20210309142118" /><signatureCode code="S" /><signatureText>X</signatureText><AgentOrgSDS classCode="AGNT"><agentOrganizationSDS classCode="ORG" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.1.10" extension="A91720" /></agentOrganizationSDS></AgentOrgSDS></author><responsibleParty typeCode="RESP"><agentDirectory classCode="AGNT"><part typeCode="PART"><Agent classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /><id root="2.16.840.1.113883.2.1.4.2" extension="1708079" /><code code="309394004" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="General Practitioner Principal"><originalText>General Medical Practitioner</originalText></code><agentPerson classCode="PSN" determinerCode="INSTANCE"><name><prefix>Dr</prefix><given>Assurance</given><family>Team2</family></name></agentPerson></Agent></part></agentDirectory></responsibleParty><component typeCode="COMP"><ehrComposition classCode="COMPOSITION" moodCode="EVN"><id root="D69F110E-B902-4BAB-926F-374E5551C8F6" /><code code="24591000000103" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Other report" /><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="202103091412" /><author typeCode="AUT" contextControlCode="OP"><time value="20210309141348" /><agentRef classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /></agentRef></author><location typeCode="LOC"><locatedEntity classCode="LOCE"><code code="1101121000000108" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Healthcare related organisation" /><locatedPlace classCode="PLC" determinerCode="INSTANCE"><name>Walton Villiage R</name></locatedPlace></locatedEntity></location><Participant2 typeCode="RESP" contextControlCode="OP"><agentRef classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /></agentRef></Participant2><component typeCode="COMP"><CompoundStatement classCode="TOPIC" moodCode="EVN"><id root="69B0EFEA-FBC5-4187-AC26-3B2F396C43A8" /><code code="Z....00" codeSystem="2.16.840.1.113883.2.1.6.2" displayName="UnspecifiedCondtions" /><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="202103091412" /><component typeCode="COMP" contextConductionInd="true"><CompoundStatement classCode="CATEGORY" moodCode="EVN"><id root="A18E5141-914F-449D-8D77-3D027E29091C" /><code code="1712901000006107" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Document" /><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="202103091412" /><component typeCode="COMP" contextConductionInd="true"><NarrativeStatement classCode="OBS" moodCode="EVN"><id root="36C261BD-B8B8-45A4-BAC5-E878477E8E05" /><text>Blood sent for chemistry (09-Mar-2021)</text><statusCode code="COMPLETE" /><availabilityTime value="202103091412" /><reference typeCode="REFR"><referredToExternalDocument classCode="DOC" moodCode="EVN"><id root="4AB6EDEE-958F-4828-BDA5-B49285A83B3E" /><code code="25821000000100" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Original text document"><originalText>Blood sent for chemistry</originalText></code><text mediaType="application/octet-stream"><reference value="file://localhost/4AB6EDEE-958F-4828-BDA5-B49285A83B3E_sample.bin" /></text></referredToExternalDocument></reference></NarrativeStatement></component></CompoundStatement></component></CompoundStatement></component></ehrComposition></component><component typeCode="COMP"><ehrComposition classCode="COMPOSITION" moodCode="EVN"><id root="133FD9C8-0D6A-4B5B-8CEF-9226A82F4A9C" /><code code="196401000000100" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Non-consultation data"><originalText>Summary Event Entry</originalText></code><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="20210309" /><author typeCode="AUT" contextControlCode="OP"><time value="20210309140137" /><agentRef classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /></agentRef></author><Participant2 typeCode="RESP" contextControlCode="OP"><agentRef classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /></agentRef></Participant2><component typeCode="COMP"><ObservationStatement classCode="OBS" moodCode="EVN"><id root="8107DD3B-1D0A-4242-94D4-5C0832F401F1" /><code code="EMISNQPR489" codeSystem="2.16.840.1.113883.2.1.6.3" displayName="Preferred method of contact: unknown" /><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="20210309" /></ObservationStatement></component></ehrComposition></component></ehrFolder></component><inFulfillmentOf typeCode="FLFS"><priorEhrRequest classCode="EXTRACT" moodCode="RQO"><id root="BBBBA01A-A9D1-A411-F824-9F7A00A33757" /></priorEhrRequest></inFulfillmentOf><limitation typeCode="LIMIT" inversionInd="true"><limitingEhrExtractSpecification classCode="OBS" moodCode="DEF"><id root="872B912A-35EA-4065-B7D0-5B1A802905B8" /><code code="715751000000105" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Entire record available to originator" /></limitingEhrExtractSpecification></limitation></EhrExtract></subject></ControlActEvent></RCMR_IN030000UK06>',
  attachments: []
};

export const payload = ` <RCMR_IN030000UK06 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="urn:hl7-org:v3"><id root="1dacd95d-a0fe-4bc2-bf6a-c373a8924198" /><creationTime value="20210309142118" /><versionCode code="V3NPfIT3.1.10" /><interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="RCMR_IN030000UK06" /><processingCode code="P" /><processingModeCode code="T" /><acceptAckCode code="NE" /><communicationFunctionRcv typeCode="RCV"><device classCode="DEV" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.2.0.107" extension="200000001161" /></device></communicationFunctionRcv><communicationFunctionSnd typeCode="SND"><device classCode="DEV" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.2.0.107" extension="200000000631" /></device></communicationFunctionSnd><ControlActEvent classCode="CACT" moodCode="EVN"><author1 typeCode="AUT"><AgentSystemSDS classCode="AGNT"><agentSystemSDS classCode="DEV" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.2.0.107" extension="200000000631" /></agentSystemSDS></AgentSystemSDS></author1><subject typeCode="SUBJ" contextConductionInd="false"><EhrExtract classCode="EXTRACT" moodCode="EVN"><id root="5EF68481-F1E8-4C1C-A3D3-3C40F460CBBA" /><statusCode code="COMPLETE" /><availabilityTime value="20210309142118" /><recordTarget typeCode="RCT"><patient classCode="PAT"><id root="2.16.840.1.113883.2.1.4.1" extension="9692842312" /></patient></recordTarget><author typeCode="AUT"><time value="20210309142118" /><signatureCode code="S" /><signatureText>X</signatureText><AgentOrgSDS classCode="AGNT"><agentOrganizationSDS classCode="ORG" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.1.10" extension="A91720" /></agentOrganizationSDS></AgentOrgSDS></author><destination typeCode="DST"><AgentOrgSDS classCode="AGNT"><agentOrganizationSDS classCode="ORG" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.1.10" extension="B86041" /></agentOrganizationSDS></AgentOrgSDS></destination><component typeCode="COMP"><ehrFolder classCode="FOLDER" moodCode="EVN"><id root="0405EC09-657A-406C-ACB5-3D7EDAD0A9B9" /><statusCode code="COMPLETE" /><effectiveTime><low value="20210309" /><high value="20210309142118" /></effectiveTime><availabilityTime value="20210309142118" /><author typeCode="AUT"><time value="20210309142118" /><signatureCode code="S" /><signatureText>X</signatureText><AgentOrgSDS classCode="AGNT"><agentOrganizationSDS classCode="ORG" determinerCode="INSTANCE"><id root="1.2.826.0.1285.0.1.10" extension="A91720" /></agentOrganizationSDS></AgentOrgSDS></author><responsibleParty typeCode="RESP"><agentDirectory classCode="AGNT"><part typeCode="PART"><Agent classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /><id root="2.16.840.1.113883.2.1.4.2" extension="1708079" /><code code="309394004" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="General Practitioner Principal"><originalText>General Medical Practitioner</originalText></code><agentPerson classCode="PSN" determinerCode="INSTANCE"><name><prefix>Dr</prefix><given>Assurance</given><family>Team2</family></name></agentPerson></Agent></part></agentDirectory></responsibleParty><component typeCode="COMP"><ehrComposition classCode="COMPOSITION" moodCode="EVN"><id root="D69F110E-B902-4BAB-926F-374E5551C8F6" /><code code="24591000000103" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Other report" /><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="202103091412" /><author typeCode="AUT" contextControlCode="OP"><time value="20210309141348" /><agentRef classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /></agentRef></author><location typeCode="LOC"><locatedEntity classCode="LOCE"><code code="1101121000000108" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Healthcare related organisation" /><locatedPlace classCode="PLC" determinerCode="INSTANCE"><name>Walton Villiage R</name></locatedPlace></locatedEntity></location><Participant2 typeCode="RESP" contextControlCode="OP"><agentRef classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /></agentRef></Participant2><component typeCode="COMP"><CompoundStatement classCode="TOPIC" moodCode="EVN"><id root="69B0EFEA-FBC5-4187-AC26-3B2F396C43A8" /><code code="Z....00" codeSystem="2.16.840.1.113883.2.1.6.2" displayName="UnspecifiedCondtions" /><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="202103091412" /><component typeCode="COMP" contextConductionInd="true"><CompoundStatement classCode="CATEGORY" moodCode="EVN"><id root="A18E5141-914F-449D-8D77-3D027E29091C" /><code code="1712901000006107" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Document" /><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="202103091412" /><component typeCode="COMP" contextConductionInd="true"><NarrativeStatement classCode="OBS" moodCode="EVN"><id root="36C261BD-B8B8-45A4-BAC5-E878477E8E05" /><text>Blood sent for chemistry (09-Mar-2021)</text><statusCode code="COMPLETE" /><availabilityTime value="202103091412" /><reference typeCode="REFR"><referredToExternalDocument classCode="DOC" moodCode="EVN"><id root="4AB6EDEE-958F-4828-BDA5-B49285A83B3E" /><code code="25821000000100" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Original text document"><originalText>Blood sent for chemistry</originalText></code><text mediaType="application/octet-stream"><reference value="file://localhost/4AB6EDEE-958F-4828-BDA5-B49285A83B3E_sample.bin" /></text></referredToExternalDocument></reference></NarrativeStatement></component></CompoundStatement></component></CompoundStatement></component></ehrComposition></component><component typeCode="COMP"><ehrComposition classCode="COMPOSITION" moodCode="EVN"><id root="133FD9C8-0D6A-4B5B-8CEF-9226A82F4A9C" /><code code="196401000000100" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Non-consultation data"><originalText>Summary Event Entry</originalText></code><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="20210309" /><author typeCode="AUT" contextControlCode="OP"><time value="20210309140137" /><agentRef classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /></agentRef></author><Participant2 typeCode="RESP" contextControlCode="OP"><agentRef classCode="AGNT"><id root="3A22840B-7DE2-50BC-CF60-29C27A30D575" /></agentRef></Participant2><component typeCode="COMP"><ObservationStatement classCode="OBS" moodCode="EVN"><id root="8107DD3B-1D0A-4242-94D4-5C0832F401F1" /><code code="EMISNQPR489" codeSystem="2.16.840.1.113883.2.1.6.3" displayName="Preferred method of contact: unknown" /><statusCode code="COMPLETE" /><effectiveTime><center nullFlavor="NI" /></effectiveTime><availabilityTime value="20210309" /></ObservationStatement></component></ehrComposition></component></ehrFolder></component><inFulfillmentOf typeCode="FLFS"><priorEhrRequest classCode="EXTRACT" moodCode="RQO"><id root="BBBBA01A-A9D1-A411-F824-9F7A00A33757" /></priorEhrRequest></inFulfillmentOf><limitation typeCode="LIMIT" inversionInd="true"><limitingEhrExtractSpecification classCode="OBS" moodCode="DEF"><id root="872B912A-35EA-4065-B7D0-5B1A802905B8" /><code code="715751000000105" codeSystem="2.16.840.1.113883.2.1.3.2.4.15" displayName="Entire record available to originator" /></limitingEhrExtractSpecification></limitation></EhrExtract></subject></ControlActEvent></RCMR_IN030000UK06>`;