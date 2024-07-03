#!/bin/bash

DB_HOST=$(gcloud secrets versions access latest --secret="dev-db-host")
DB_PORT=$(gcloud secrets versions access latest --secret="dev-db-port")
DB_DATABASE=$(gcloud secrets versions access latest --secret="dev-db-database")
DB_USERNAME=$(gcloud secrets versions access latest --secret="dev-db-username")
DB_PASSWORD=$(gcloud secrets versions access latest --secret="dev-db-password")

echo "NODE_ENV=development" >> .env
echo "APP_NAME=AIC API" >> .env
echo "PORT=3000" >> .env

echo "DB_HOST=$DB_HOST" >> .env
echo "DB_PORT=$DB_PORT" >> .env
echo "DB_DATABASE=$DB_DATABASE" >> .env
echo "DB_USERNAME=$DB_USERNAME" >> .env
echo "DB_PASSWORD=$DB_PASSWORD" >> .env