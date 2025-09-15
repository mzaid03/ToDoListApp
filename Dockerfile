# Railway-compatible Dockerfile for Next.js app router + Prisma + SQLite
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
# Install openssl for Prisma engines
RUN apk add --no-cache openssl
# Install deps
COPY package*.json ./
RUN npm ci --ignore-scripts
# Copy source and build
COPY . .
# Generate Prisma client now that schema is present
RUN npx prisma generate
# Build Next.js without triggering DB operations at build time
RUN npx next build

# Runtime stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
# Install openssl for Prisma engines
RUN apk add --no-cache openssl
# Install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
# Copy built app and necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tailwind.config.ts ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/prisma ./prisma
# Ensure Prisma client is available in runtime image (schema is now present)
RUN npx prisma generate
# Expose port
EXPOSE 3000
# Start with migration deploy (or db push) then server
CMD ["npm", "run", "start:prod"]
