FROM node:14.17.1-alpine
WORKDIR /app
COPY package*.json ./
COPY build/ /app/

RUN apk update && apk add openssl ca-certificates git jq && rm -rf /var/cache/apk/*
RUN apk add --no-cache \
        python3 \
        py3-pip \
    && pip3 install --upgrade pip \
    && pip3 install \
        awscli \
    && rm -rf /var/cache/apk/*

COPY ./certs/deductions.crt /usr/local/share/ca-certificates/deductions.crt
RUN update-ca-certificates

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/deductions.crt

EXPOSE 3000
RUN apk add --no-cache tini bash

COPY scripts/load-api-keys.sh /app/scripts/load-api-keys.sh
COPY run-server.sh /usr/bin/run-gp2gp-server

ENV GP2GP_ADAPTOR_REPOSITORY_ASID=deduction-asid \
  GP2GP_ADAPTOR_REPOSITORY_ODS_CODE=deduction-ods \
  NHS_ENVIRONMENT=local \
  GP2GP_ADAPTOR_MHS_OUTBOUND_URL="" \
  GP2GP_ADAPTOR_MHS_ROUTE_URL=""

RUN npm install

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/usr/bin/run-gp2gp-server"]
