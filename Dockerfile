FROM node:18-slim

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libnss3 \
    libxcursor1 \
    libxss1 \
    libwayland-client0 \
    libwayland-server0 \
    libatspi2.0-0 \
    libxinerama1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json /app/

# Install dependencies
RUN npm ci --omit=dev

# Copy app files
COPY . /app/

# Expose port and run the app
EXPOSE 3000
CMD ["node", "api/capture_api_service.js"]
