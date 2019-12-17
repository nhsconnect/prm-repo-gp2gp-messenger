FROM node:11.15.0-alpine
WORKDIR /app
COPY package*.json ./
COPY node_modules/ ./node_modules
COPY build/ /app/

RUN apk update && apk add openssl ca-certificates && rm -rf /var/cache/apk/*
COPY ./certs/deductions.crt /usr/local/share/ca-certificates/deductions.crt
RUN update-ca-certificates

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/deductions.crt

EXPOSE 3000
RUN apk add --no-cache tini bash

COPY run-server.sh /usr/bin/run-gp2gp-server

ENV AUTHORIZATION_KEYS="auth-key-1,auth-key-2" \
  DEDUCTIONS_ASID=deduction-asid \
  DEDUCTIONS_ODS_CODE=deduction-ods \
  NODE_ENV=local \
  MHS_QUEUE_NAME=gp2gp-test \
  MHS_DLQ_NAME=gp2gp-test.dlq \
  MHS_QUEUE_URL_1=tcp://localhost:61610 \
  MHS_QUEUE_URL_2="" \
  MHS_QUEUE_USERNAME="" \
  MHS_QUEUE_PASSWORD="" \
  S3_BUCKET_NAME=""

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/usr/bin/run-gp2gp-server"]
