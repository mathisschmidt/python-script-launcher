# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies (for potential Python scripts and build tools)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies and install only production dependencies
WORKDIR /app/build
RUN npm ci --omit=dev

# Create .env file with production settings
RUN cp /app/.env.example .env && \
    sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env && \
    sed -i 's/HOST=localhost/HOST=0.0.0.0/' .env

# Generate APP_KEY if using AdonisJS
RUN node ace generate:key || echo "APP_KEY generation skipped"

# Run database migrations
RUN node ace migration:refresh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3333/health || exit 1

# Start the server
CMD ["node", "bin/server.js"]
