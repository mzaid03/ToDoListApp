# Railway-compatible Dockerfile for Next.js app router + Prisma + SQLite
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
# Install deps
COPY package*.json ./
RUN npm ci
# Copy source and build
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev
# Copy built app and necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tailwind.config.ts ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/prisma ./prisma
# Ensure Prisma client is available in runtime image
RUN npx prisma generate
# Expose port
EXPOSE 3000
# Start with migration deploy (or db push) then server
CMD ["npm", "run", "start:prod"]
