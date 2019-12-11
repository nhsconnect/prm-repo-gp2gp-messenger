# Deductions GP2GP adaptor

## Prerequisites

* Node 12.x

## Set up

Run `npm install` to install all node dependencies.

Create a .env file using the .env.sample file. The `AUTHORIZATION_KEYS` should be a comma-separated list. The app will 
use a fake MHS when `NODE_ENV` is set to `local` or `dev`. 

Here is an example for your local environment:

```
AUTHORIZATION_KEYS=auth-key-1,auth-key-2
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
```

Locally, the variables `AUTHORIZATION_KEYS`, `DEDUCTIONS_ASID`, `DEDUCTIONS_ODS_CODE` and `MHS_QUEUE_NAME` can be set 
to any value and the variables `MHS_QUEUE_USERNAME`, `MHS_QUEUE_PASSWORD` and `S3_BUCKET_NAME` do not need to be set at 
all.

## Running the tests

Run the tests with `npm test`.

## Start the app locally

Run a development server with `npm run start-local`.

### Swagger

The swagger documentation for the app can be found at http://localhost:3000/. To update it, change the 
`src/swagger.json` file. You can use the editor https://editor.swagger.io/ which will validate your changes.

### Example request

```
curl -X POST "http://localhost:3000/ehr-request" -H "accept: application/json" -H "Authorization: auth-key-1" -H "Content-Type: application/json" -d "{ \"nhsNumber\": \"some-nhs-number\", \"odsCode\": \"some-ods-code\"}"
```

## Start the app in production mode

Compile the code with `npm run build`, and then start the server with `npm start`.
