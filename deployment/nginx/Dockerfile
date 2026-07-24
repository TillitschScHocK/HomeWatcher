# Single nginx container:
#   - serves the Vite/React build as static files at /
#   - proxies /api/, /socket.io/, /proxy/ to the backend at 127.0.0.1:5000
#   - serves /streams/ from the tmpfs volume
#
# Using a two-stage build: first build the frontend, then copy the
# dist output into nginx. This means only ONE nginx process runs,
# on port 80, with no port conflicts.

# Stage 1: build the frontend
FROM node:20 AS frontend-builder

WORKDIR /app

ARG VITE_BACKEND_URL
ARG VITE_STREAM_DELAY
ARG VITE_STREAM_PROXY_DELAY
ARG VITE_SYNCHRONIZATION_TOLERANCE
ARG VITE_SYNCHRONIZATION_MAX_DEVIATION
ARG VITE_SYNCHRONIZATION_ADJUSTMENT
ARG VITE_SYNCHRONIZATION_MAX_ADJUSTMENT

COPY ../../frontend/package.json ../../frontend/package-lock.json ./
RUN npm install

COPY ../../frontend/ .

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_STREAM_DELAY=$VITE_STREAM_DELAY
ENV VITE_STREAM_PROXY_DELAY=$VITE_STREAM_PROXY_DELAY
ENV VITE_SYNCHRONIZATION_TOLERANCE=$VITE_SYNCHRONIZATION_TOLERANCE
ENV VITE_SYNCHRONIZATION_MAX_DEVIATION=$VITE_SYNCHRONIZATION_MAX_DEVIATION
ENV VITE_SYNCHRONIZATION_ADJUSTMENT=$VITE_SYNCHRONIZATION_ADJUSTMENT
ENV VITE_SYNCHRONIZATION_MAX_ADJUSTMENT=$VITE_SYNCHRONIZATION_MAX_ADJUSTMENT

RUN npm run build

# Stage 2: nginx serving static files + reverse proxy
FROM nginx:alpine

# Remove default server block to avoid duplicate listen 80
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# nginx.conf is mounted at runtime via docker-compose volume
