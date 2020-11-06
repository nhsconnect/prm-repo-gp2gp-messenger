#!/bin/bash

# This script executes on docker container start.
# It waits for MQ connection to be available before starting the application.

MQ_CONNECTION_TIMEOUT=30

MQ_HOST_1=$(echo $GP2GP_ADAPTOR_MHS_QUEUE_URL_1 | awk -F "://" '{print $2}' |  awk -F ":" '{print $1}')
MQ_PORT_1=$(echo $GP2GP_ADAPTOR_MHS_QUEUE_URL_1 | awk -F "://" '{print $2}' |  awk -F ":" '{print $2}')
MQ_HOST_2=$(echo $GP2GP_ADAPTOR_MHS_QUEUE_URL_2 | awk -F "://" '{print $2}' |  awk -F ":" '{print $1}')
MQ_PORT_2=$(echo $GP2GP_ADAPTOR_MHS_QUEUE_URL_2 | awk -F "://" '{print $2}' |  awk -F ":" '{print $2}')

echo "Waiting for any MQ port to be open"
count=0
while ! nc -z ${MQ_HOST_1} ${MQ_PORT_1} && ! nc -z ${MQ_HOST_2} ${MQ_PORT_2}; do
  echo "Waiting for MQ at ${MQ_HOST_1}:${MQ_PORT_1} or ${MQ_HOST_2}:${MQ_PORT_2}"
  sleep 2
  ((count++))
  if [ "${MQ_CONNECTION_TIMEOUT}" -le $count ]; then
    echo "Timed-out waiting for MQ connection at ${MQ_HOST_1}:${MQ_PORT_1} or ${MQ_HOST_2}:${MQ_PORT_2}"
    exit 5
  fi
done

echo "MQ is available. Waiting 5 seconds before connecting"
sleep 5
# After tcp port is open, it takes a moment for server to be ready

echo "MQ is available. Starting node.js server"
set -e
exec node server.js
