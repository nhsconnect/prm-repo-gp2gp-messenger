# Deductions GP2GP adaptor

## Prerequisites

* Node 12.x

## Set up

Run `npm install` to install all node dependencies.

Create a .env file using the .env.sample file. The `AUTHORIZATION_KEYS` should be a comma-separated list. The app will 
use a fake MHS when `NODE_ENV` is set to `local` or `dev`.

### Run locally
set your `NODE_ENV=local` 

The correct MHS Queue url =`tcp://localhost:61613` The reason to have two urls is for testing.
You should have one failed url and one correct url for `MHS_QUEUE_URL_1` and `MHS_QUEUE_URL_2`  

`MHS_QUEUE_NAME` could be the queue you already created locally or give any name you want, 
if it could not find a queue with that name, it will create one for us.  

`AUTHORIZATION_KEYS`, `DEDUCTIONS_ASID`, `DEDUCTIONS_ODS_CODE` can be anything you like for local environment.

Example variables for .env as below

```
AUTHORIZATION_KEYS=auth-key-1
DEDUCTIONS_ASID=deduction-asid
DEDUCTIONS_ODS_CODE=deduction-ods
NODE_ENV=local
MHS_QUEUE_NAME=gp2gp-test
MHS_QUEUE_URL_1=tcp://localhost:61610
MHS_QUEUE_URL_2=tcp://localhost:61613
MHS_QUEUE_USERNAME=
MHS_QUEUE_PASSWORD=
S3_BUCKET_NAME=
```

### Run dev mode
set your `NODE_ENV=dev`

It should pick up variables value from AWS parameter store or secret store automatically.

## Running the tests

Run the tests with `npm test`.

## Start the app locally

Run a development server with `npm run start-local`.

## Start the app in production mode

Compile the code with `npm run build`, and then start the server with `npm start`.
