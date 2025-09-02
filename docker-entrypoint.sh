#!/bin/sh

# Run database migrations
echo "Running database migrations..."
node ace migration:run

# Start the server
echo "Starting the server..."
exec node bin/server.js
