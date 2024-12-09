# Use Node.js LTS version
FROM node:18-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache libc6-compat python3 make g++

# Set working directory
WORKDIR /app

# Install yarn globally
RUN npm install -g yarn

# Copy package files
COPY package.json yarn.lock ./
COPY apps/next/package.json ./apps/next/package.json
COPY packages/ ./packages/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN cd apps/next && yarn build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/apps/next/.next ./.next
COPY --from=builder /app/apps/next/public ./public
COPY --from=builder /app/apps/next/package.json ./package.json
COPY --from=builder /app/apps/next/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"] 