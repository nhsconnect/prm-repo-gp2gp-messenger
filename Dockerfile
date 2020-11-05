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

ENV MHS_QUEUE_VIRTUAL_HOST="/" \
  DEDUCTIONS_ASID=deduction-asid \
  DEDUCTIONS_ODS_CODE=deduction-ods \
  NODE_ENV=local \
  MHS_QUEUE_NAME=gp2gp-test \
  MHS_QUEUE_URL_1=tcp://localhost:61613 \
  MHS_QUEUE_URL_2="" \
  MHS_QUEUE_USERNAME="" \
  MHS_QUEUE_PASSWORD="" \
  S3_BUCKET_NAME="" \
  EHR_REPO_URL="" \
  GP_TO_REPO_URL="" \
  MHS_OUTBOUND_URL="" \
  MHS_ROUTE_URL="" \
  GP2GP_ADAPTOR_AUTHORIZATION_KEYS="auth-key-1" \
  GP_TO_REPO_AUTHORIZATION_KEYS=""

RUN npm install

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/usr/bin/run-gp2gp-server"]
