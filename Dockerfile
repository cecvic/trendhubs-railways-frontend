# Use Node.js LTS version
FROM node:18-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache libc6-compat python3 make g++

# Set working directory
WORKDIR /app

# Copy package files and configuration
COPY package.json package-lock.json ./
COPY tsconfig.json next.config.js ./
COPY tailwind.config.js postcss.config.js ./

# Install dependencies
RUN npm ci

# Copy source code and public assets
COPY src/ ./src/
COPY public/ ./public/

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 