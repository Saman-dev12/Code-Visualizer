# Base image
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies image
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Builder image
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create .env.production from environment variables
RUN echo "DATABASE_URL=$DATABASE_URL" >> .env.production
RUN echo "NEXT_PUBLIC_DATABASE_URL=$NEXT_PUBLIC_DATABASE_URL" >> .env.production
RUN echo "AUTH_DRIZZLE_URL=$AUTH_DRIZZLE_URL" >> .env.production
RUN echo "GOOGLE_API_KEY=$GOOGLE_API_KEY" >> .env.production
RUN echo "NEXTAUTH_URL=$NEXTAUTH_URL" >> .env.production
RUN echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> .env.production
RUN echo "JWT_SECRET=$JWT_SECRET" >> .env.production
RUN echo "JWT_SIGNING_KEY=$JWT_SIGNING_KEY" >> .env.production
RUN echo "JWT_ENCRYPTION_KEY=$JWT_ENCRYPTION_KEY" >> .env.production
RUN echo "JWT_MAX_AGE=$JWT_MAX_AGE" >> .env.production
RUN echo "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL" >> .env.production

RUN npm run build

# Runner image
FROM base AS runner
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.env.production ./.env.production

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "server.js"]