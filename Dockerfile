FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci

# Copy entire project (termasuk env dan config)
COPY . .

# Build for production
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/db/schema.ts ./src/db/schema.ts
COPY --from=builder /app/src/db/migrations ./src/db/migrations

EXPOSE 3001

# Jalankan db push dulu baru start app
CMD ["sh", "-c", "npm run db:push && npm start"]
