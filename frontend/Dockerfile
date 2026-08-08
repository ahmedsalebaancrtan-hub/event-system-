# =========================
# Stage 1: Build React App
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Always use relative /api in Docker builds so nginx proxies to the backend container.
ENV VITE_API_BASE_URL=/api

# Build React/Vite application
RUN npm run build


# =========================
# Stage 2: Production Server
# =========================
FROM nginx:alpine AS deployment

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy React build files
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose HTTP port
EXPOSE 80

# Start nginx (proxy target configurable via BACKEND_HOST / BACKEND_PORT)
ENTRYPOINT ["/docker-entrypoint.sh"]
