# --- Builder stage ---
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

WORKDIR /app/build
RUN npm ci --omit=dev

RUN cp /app/.env.example .env && \
    sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env && \
    sed -i 's/HOST=localhost/HOST=0.0.0.0/' .env

RUN node ace generate:key || echo "APP_KEY generation skipped"

# --- Final image ---
FROM node:18-alpine

WORKDIR /app/build

# Copy only the built app and production node_modules
COPY --from=builder /app/build /app/build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Create and set permissions for tmp directory
RUN mkdir -p /app/build/tmp && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3333/health || exit 1

# Create an entrypoint script to run migrations before starting the server
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/build/
RUN chmod +x /app/build/docker-entrypoint.sh

ENTRYPOINT ["/app/build/docker-entrypoint.sh"]
