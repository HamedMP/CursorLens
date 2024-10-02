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

ARG DATABASE_URL
ARG OPENAI_API_KEY
ARG ANTHROPIC_API_KEY
ARG COHERE_API_KEY
ARG MISTRAL_API_KEY
ARG APP_PORT
ENV DATABASE_URL=${DATABASE_URL}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
ENV COHERE_API_KEY=${COHERE_API_KEY}
ENV MISTRAL_API_KEY=${MISTRAL_API_KEY}
ENV APP_PORT=${APP_PORT}

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE ${APP_PORT}

# Start the application
CMD ["sh", "./start.sh"]