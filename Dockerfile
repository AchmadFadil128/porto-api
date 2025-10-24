FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build

FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/db/schema.ts ./src/db/schema.ts
COPY --from=builder /app/src/db/migrations ./src/db/migrations

# Create uploads directory and set permissions
RUN mkdir -p public/uploads
RUN chmod -R 777 public/uploads

EXPOSE 3001
CMD ["sh", "-c", "npm run db:push && npm start"]