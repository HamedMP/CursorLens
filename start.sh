#!/bin/sh

# Run migrations
pnpm prisma migrate deploy

# Seed the database
pnpm prisma db seed

# Start the application
pnpm start