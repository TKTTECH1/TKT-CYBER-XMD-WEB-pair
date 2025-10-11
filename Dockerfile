FROM node:18-alpine

# Install required dependencies
RUN apk add --no-cache \
    ffmpeg \
    imagemagick \
    libwebp-tools \
    bash

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --no-audit --no-fund

# Install global packages
RUN npm install -g qrcode-terminal pm2

# Copy application code
COPY . .

# Create non-root user and set permissions
RUN adduser -D appuser && chown -R appuser:appuser /usr/src/app
USER appuser

EXPOSE 5000

# Use pm2 to manage the process (better for production)
CMD ["pm2-runtime", "start", "npm", "--", "start"]
