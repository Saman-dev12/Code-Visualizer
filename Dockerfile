# Base image
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Development image (we don't need build and runner stages for dev)
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Start command with explicit polling for hot reload
CMD ["npm", "run", "dev"]