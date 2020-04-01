# Deductions GP2GP adaptor

This is a Proof of Concept implementation of a component to handle the sending and receiving of the GP2GP message set used to transfer a patient's Electronic Health Record between GP Practices.

The goal is to confirm the GP2GP message format can be used to transfer Orphan and Standard Records into a secure NHS repository.

This component will communicate with the Message Handler Service (MHS) [GitHub nhsconnect/integration-adaptors](https://github.com/nhsconnect/integration-adaptors) and other components being developed by the Orphan and Stranded Record programme.

The initial version will send and receive health records that are encoded in the HL7 format. A subsequent enhancement will be access to the components of the Health Record so that other services can use this component to send and receive Health Records with the need to implement the encoding and fragmentation strategies of the [GP2GP v2.2a](https://data.developer.nhs.uk/dms/mim/6.3.01/Domains/GP2GP/Document%20files/GP2GP%20IM.htm) message specification .

## Prerequisites

- Node 12.x

## Set up

1. Run `npm install` to install all node dependencies.
2. Create a .env file at the root of the directory
3. Copy the contents of the [.env.sample](./.env.sample) file at the root of the directory, and paste into the .env file. The .env.sample file contains template environment variables.
4. If you would like to run locally, following the steps below, otherwise fill in the required fields.
   - Note: The `AUTHORIZATION_KEYS` should be a string.
5. The app will use a fake MHS when `NODE_ENV` is set to `local` or `dev`. Here is an example for a local environment .env file, that can replace the contents of the .env.

   ```
   AUTHORIZATION_KEYS=auth-key-1
   MHS_QUEUE_VIRTUAL_HOST="/"
   DEDUCTIONS_ASID=deduction-asid
   DEDUCTIONS_ODS_CODE=deduction-ods
   NODE_ENV=local
   MHS_QUEUE_NAME=gp2gp-test
   MHS_QUEUE_URL_1=tcp://localhost:61610
   MHS_QUEUE_URL_2=tcp://localhost:61613
   MHS_QUEUE_VIRTUAL_HOST=/
   MHS_QUEUE_USERNAME=
   MHS_QUEUE_PASSWORD=
   EHR_REPO_URL=http://ehr-repo.com
   PDS_ASID=
   MHS_OUTBOUND_URL=
   ```

- Locally, the variables `AUTHORIZATION_KEYS`, `DEDUCTIONS_ASID`, `DEDUCTIONS_ODS_CODE` and `MHS_QUEUE_NAME` can be set
  to any value and the variables `MHS_QUEUE_USERNAME` and `MHS_QUEUE_PASSWORD` do not need to be set at
  all.
- `MHS_QUEUE_VIRTUAL_HOST` should be set to `/` on a typical rabbitmq setup, but it might other values depending on what queue hosting is used.

## Running the tests

Run the unit tests with

`npm test` or `./tasks test`

Run the integration tests.

1. Run `docker-compose up` to set up the message queues. 
2. Run `npm run test:integration`.

Alternatively, run `./tasks test_integration` (runs the tests within a Dojo container)

Run the coverage tests (unit test and integration test)

1. Run `docker-compose up` to set up the message queues.
2. Run `npm run test:coverage`.

Alternatively, run `./tasks test_coverage` (runs the tests within a Dojo container)

## Start the app locally

1. Run the message queues in docker by using `docker-compose up &`. Make sure your .env has the following config
2. Run a development server with `npm run start:local`, to start together with a linked MQ server. You can access the queues using the Rabbit MQ console on: http://localhost:15672/
3. If successful, it will print a message similar to the following in the terminal:


```.env
// .env
MHS_QUEUE_NAME=<any-name>
MHS_QUEUE_URL_1=tcp://localhost:61620
MHS_QUEUE_URL_2=tcp://localhost:61621
MHS_QUEUE_VIRTUAL_HOST=/
MHS_QUEUE_USERNAME=admin
MHS_QUEUE_PASSWORD=admin
```

```
// console
{
  message: 'Listening on port 3000',
  level: 'info',
  correlationId: undefined,
  timestamp: '2020-01-31T11:47:19.763Z'
}
```

### Swagger

The swagger documentation for the app can be found at http://localhost:3000/swagger. To update it, change the
`src/swagger.json` file. You can use the editor https://editor.swagger.io/ which will validate your changes.

### Example request

```
curl -X POST "http://localhost:3000/ehr-request" -H "accept: application/json" -H "Authorization: auth-key-1" -H "Content-Type: application/json" -d "{ \"nhsNumber\": \"some-nhs-number\", \"odsCode\": \"some-ods-code\"}"
```

## Start the app in production mode

Compile the code with `npm run build`, and then start the server with `npm start`.

# Testing Locally (Dev/Test)

When debugging, it may be useful to be able to connect to either the `dev` or `test` message queues.

## Config

Update the .env file with the following config items can be found in SSM properties under the following locations:

| Parameters         | SSM Parameter                                                |
|--------------------|--------------------------------------------------------------|
| MHS_QUEUE_URL_1    | /NHS/${NHS_ENVIRONMENT}-${ORG_CODE}/amqp-endpoint/0          |
| MHS_QUEUE_URL_2    | /NHS/${NHS_ENVIRONMENT}-${ORG_CODE}/amqp-endpoint/1          |
| MHS_QUEUE_USERNAME | /nhs/${NHS_ENVIRONMENT}/mq/admin-username                    |
| MHS_QUEUE_PASSWORD | /nhs/${NHS_ENVIRONMENT}/mq/admin-password                    |
| MHS_QUEUE_NAME     | Please set this to something different than in Terraform     |

Ensure you have VPN connection set up to both `dev` and `test` environments:
[CLICK HERE](https://gpitbjss.atlassian.net/wiki/spaces/TW/pages/1832779966/VPN+for+Deductions+Services)

## Setup

In AmazonMQ settings for either the `dev` or `test` provision. Edit the `deductor-amq-broker-${NHS_ENVIRONMENT}` 
security group inbound rules. Add new rule that allows All TCP from the `${NHS_ENVIRONMENT} VPN VM security group`, 
apply before running the following:

```
// Starts the server locally using `.env`
$ NHS_ENVIRONMENT=test npm run start:local
```

