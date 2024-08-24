FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN apk update

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["sh", "./start.sh"]