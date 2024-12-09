# Use Node.js LTS version
FROM node:18-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache libc6-compat python3 make g++

# Set working directory
WORKDIR /app

# Install yarn globally
RUN npm install -g yarn

# Copy package files and configuration
COPY package.json yarn.lock ./
COPY tsconfig.json next.config.js ./
COPY tailwind.config.js postcss.config.js ./

# Copy source code and dependencies
COPY src/ ./src/
COPY public/ ./public/

# Install dependencies
RUN yarn install --frozen-lockfile

# Build the application
RUN yarn build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"] 