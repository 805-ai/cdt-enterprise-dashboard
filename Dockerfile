# CDT Enterprise Dashboard - Unified Docker Container
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install System Dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    supervisor \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB 7
RUN curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y mongodb-org \
    && rm -rf /var/lib/apt/lists/*

# Install Redis
RUN apt-get update && apt-get install -y redis-server && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /app/server /app/ui /data/db /var/log/cdt

# Copy and build UI
WORKDIR /app/ui
COPY ui/package*.json ./
RUN npm install
COPY ui/ ./
RUN npm run build

# Copy and setup Server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production 2>/dev/null || npm init -y && npm install express cors mongoose bcryptjs jsonwebtoken
COPY server/ ./

# Copy config files
COPY config/nginx.conf /etc/nginx/sites-available/default
COPY config/supervisord.conf /etc/supervisor/conf.d/cdt.conf

# Environment defaults
ENV HMAC_SECRET=change-me-in-production-32chars
ENV JWT_SECRET=change-me-in-production-jwt-key
ENV DEMO_MODE=true
ENV NODE_ENV=production

EXPOSE 80
VOLUME ["/data/db"]

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
