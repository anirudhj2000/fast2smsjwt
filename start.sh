#!/bin/bash

# Function to wait for the database to be ready
wait_for_db() {
    echo "Waiting for DB to be ready..."
    while ! nc -z db 5432; do
        sleep 1 # wait for 1 second before check again
    done
}

# Wait for Database to become available
#wait_for_db

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy
npx prisma generate
npx prisma db push
npm run dev