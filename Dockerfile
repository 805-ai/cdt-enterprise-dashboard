# =============================================================================
# CDT Enterprise Dashboard - Unified Docker Container
# Production-ready single container with API + UI + Database
# =============================================================================

FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# =============================================================================
# Install System Dependencies
# =============================================================================

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

# =============================================================================
# Create directories
# =============================================================================

RUN mkdir -p /app/server /app/ui /data/db /var/log/cdt

# =============================================================================
# Copy and build UI
# =============================================================================

WORKDIR /app/ui
COPY ui/package*.json ./
RUN npm install
COPY ui/ ./
RUN npm run build

# =============================================================================
# Copy and setup Server
# =============================================================================

WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production 2>/dev/null || npm init -y && npm install express cors mongoose bcryptjs jsonwebtoken
COPY server/ ./

# =============================================================================
# Nginx configuration for SPA + API proxy
# =============================================================================

RUN cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name _;

    # Serve static UI files
    location / {
        root /app/ui/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3001/api/health;
    }
}
EOF

# =============================================================================
# Supervisord configuration
# =============================================================================

RUN cat > /etc/supervisor/conf.d/cdt.conf << 'EOF'
[supervisord]
nodaemon=true
logfile=/var/log/cdt/supervisord.log
pidfile=/var/run/supervisord.pid

[program:mongodb]
command=/usr/bin/mongod --dbpath /data/db --bind_ip 127.0.0.1 --quiet
autostart=true
autorestart=true
stderr_logfile=/var/log/cdt/mongodb.err.log
stdout_logfile=/var/log/cdt/mongodb.out.log
priority=1

[program:redis]
command=/usr/bin/redis-server --bind 127.0.0.1 --daemonize no
autostart=true
autorestart=true
stderr_logfile=/var/log/cdt/redis.err.log
stdout_logfile=/var/log/cdt/redis.out.log
priority=2

[program:api]
command=/usr/bin/node /app/server/server.js
directory=/app/server
autostart=true
autorestart=true
stderr_logfile=/var/log/cdt/api.err.log
stdout_logfile=/var/log/cdt/api.out.log
environment=NODE_ENV="production",PORT="3001",MONGO_URI="mongodb://127.0.0.1:27017/cdt",HMAC_SECRET="%(ENV_HMAC_SECRET)s",JWT_SECRET="%(ENV_JWT_SECRET)s",DEMO_MODE="%(ENV_DEMO_MODE)s"
priority=3
startsecs=5

[program:nginx]
command=/usr/sbin/nginx -g 'daemon off;'
autostart=true
autorestart=true
stderr_logfile=/var/log/cdt/nginx.err.log
stdout_logfile=/var/log/cdt/nginx.out.log
priority=4
EOF

# =============================================================================
# Environment defaults
# =============================================================================

ENV HMAC_SECRET=change-me-in-production-32chars
ENV JWT_SECRET=change-me-in-production-jwt-key
ENV DEMO_MODE=true
ENV NODE_ENV=production

# =============================================================================
# Expose ports and set entrypoint
# =============================================================================

EXPOSE 80
VOLUME ["/data/db"]

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
