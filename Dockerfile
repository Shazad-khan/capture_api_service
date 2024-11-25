# Use a Node.js base image
FROM node:16

# Install Xvfb, xauth, minimal GUI libraries, and Chromium dependencies
RUN apt-get update && apt-get install -y \
    xvfb \
    xauth \
    x11-utils \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxrender1 \
    libxshmfence1 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libpango1.0-0 \
    libgbm1 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy application code
COPY . .

# Install dependencies
RUN npm install

# Add Puppeteer environment configuration
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV DISPLAY=:99

# Start the application with Xvfb
CMD ["xvfb-run", "-a", "node", "src/capture_api_service.js"]
