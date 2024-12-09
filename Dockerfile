FROM alpine:3.20

ENV NODE_VERSION 22.12.0
# Set working directory
WORKDIR /app

# Copy package files and configuration
COPY package.json package-lock.json ./
COPY tsconfig.json next.config.js ./
COPY tailwind.config.js postcss.config.js ./

# Install dependencies
RUN npm install
# Copy source code and public assets
COPY src/ ./src/
COPY public/ ./public/

# Build the application
RUN npm run build

#Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 