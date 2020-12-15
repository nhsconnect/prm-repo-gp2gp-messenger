FROM node:12-alpine
WORKDIR /app
COPY package*.json ./
COPY build/ /app/

RUN apk update && apk add openssl ca-certificates git && rm -rf /var/cache/apk/*
COPY ./certs/deductions.crt /usr/local/share/ca-certificates/deductions.crt
RUN update-ca-certificates

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/deductions.crt

EXPOSE 3000
RUN apk add --no-cache tini bash

COPY run-server.sh /usr/bin/run-gp2gp-server

ENV GP2GP_ADAPTOR_MHS_QUEUE_VIRTUAL_HOST="/" \
  GP2GP_ADAPTOR_REPOSITORY_ASID=deduction-asid \
  GP2GP_ADAPTOR_ENABLE_WORKER=true \
  GP2GP_ADAPTOR_ENABLE_SERVER=true \
  GP2GP_ADAPTOR_REPOSITORY_ODS_CODE=deduction-ods \
  NODE_ENV=local \
  GP2GP_ADAPTOR_MHS_QUEUE_NAME=gp2gp-test \
  GP2GP_ADAPTOR_MHS_QUEUE_URL_1=tcp://localhost:61613 \
  GP2GP_ADAPTOR_MHS_QUEUE_URL_2="" \
  GP2GP_ADAPTOR_MHS_QUEUE_USERNAME="" \
  GP2GP_ADAPTOR_MHS_QUEUE_PASSWORD="" \
  GP2GP_ADAPTOR_S3_BUCKET_NAME="" \
  GP2GP_ADAPTOR_EHR_REPO_URL="" \
  GP2GP_ADAPTOR_GP_TO_REPO_URL="" \
  GP2GP_ADAPTOR_MHS_OUTBOUND_URL="" \
  GP2GP_ADAPTOR_MHS_ROUTE_URL="" \
  GP2GP_ADAPTOR_AUTHORIZATION_KEYS="auth-key-1" \
  GP2GP_ADAPTOR_AUTHORIZATION_KEYS_FOR_GP_TO_REPO="" \
  GP2GP_ADAPTOR_AUTHORIZATION_KEYS_FOR_EHR_REPO="" \
  GP2GP_ADAPTOR_REPO_TO_GP_URL="" \
  GP2GP_ADAPTOR_AUTHORIZATION_KEYS_FOR_REPO_TO_GP=""

RUN npm install

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/usr/bin/run-gp2gp-server"]
