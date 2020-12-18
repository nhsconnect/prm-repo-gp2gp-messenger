#!/bin/bash

# This script executes on docker container start.

echo "Starting the application"
set -e
exec node server.js
