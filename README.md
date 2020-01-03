# Deductions GP2GP adaptor
This is a Proof of Concept implementation of a component to handle the sending and receiving of the GP2GP message set used to transfer a patient's Electronic Health Record between GP Practices.

The goal is to confirm the GP2GP message format can be used to transfer Orphan and Standard Records into a secure NHS repository.

This component will communicate with the Message Handler Service (MHS) [GitHub nhsconnect/integration-adaptors](https://github.com/nhsconnect/integration-adaptors) and other components being developed by the Orphan and Stranded Record programme.

The initial version will send and receive health records that are encoded in the HL7 format. A subsequent enhancement will be access to the components of the Health Record so that other services can use this component to send and receive Health Records with the need to implement the encoding and fragmentation strategies of the [GP2GP v2.2a](https://data.developer.nhs.uk/dms/mim/6.3.01/Domains/GP2GP/Document%20files/GP2GP%20IM.htm) message specification .

## Prerequisites

* Node 12.x

## Set up

Run `npm install` to install all node dependencies.

Create a .env file using the .env.sample file. The `AUTHORIZATION_KEYS` should be a comma-separated list. The app will
use a fake MHS when `NODE_ENV` is set to `local` or `dev`.

Here is an example for your local environment:

```
AUTHORIZATION_KEYS=auth-key-1,auth-key-2
MHS_STOMP_VIRTUAL_HOST="/"
DEDUCTIONS_ASID=deduction-asid
DEDUCTIONS_ODS_CODE=deduction-ods
NODE_ENV=local
MHS_QUEUE_NAME=gp2gp-test
MHS_DLQ_NAME=gp2gp-test.dlq
MHS_QUEUE_URL_1=tcp://localhost:61610
MHS_QUEUE_URL_2=tcp://localhost:61613
MHS_QUEUE_USERNAME=
MHS_QUEUE_PASSWORD=
S3_BUCKET_NAME=
EHR_REPO_URL=http://ehr-repo.com
```
A template environment variables file is available as .env.sample

Locally, the variables `AUTHORIZATION_KEYS`, `DEDUCTIONS_ASID`, `DEDUCTIONS_ODS_CODE` and `MHS_QUEUE_NAME` can be set
to any value and the variables `MHS_QUEUE_USERNAME`, `MHS_QUEUE_PASSWORD` and `S3_BUCKET_NAME` do not need to be set at
all.
`MHS_STOMP_VIRTUAL_HOST` should be set to `/` on a typical rabbitmq setup, but it might other values depending on what queue hosting is used.

## Running the tests

Run the tests with `npm test`.

## Start the app locally

Run a development server with `npm run start-local`.

Or to start together with a linked MQ server.
```
./tasks run_local
```

### Swagger

The swagger documentation for the app can be found at http://localhost:3000/. To update it, change the
`src/swagger.json` file. You can use the editor https://editor.swagger.io/ which will validate your changes.

### Example request

```
curl -X POST "http://localhost:3000/ehr-request" -H "accept: application/json" -H "Authorization: auth-key-1" -H "Content-Type: application/json" -d "{ \"nhsNumber\": \"some-nhs-number\", \"odsCode\": \"some-ods-code\"}"
```

## Start the app in production mode

Compile the code with `npm run build`, and then start the server with `npm start`.
