# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Accept build arguments for Vite environment variables
ARG VITE_YANDEX_API_KEY
ARG VITE_YANDEX_GEOSUGGEST_KEY

# Make them available as environment variables during build
ENV VITE_YANDEX_API_KEY=$VITE_YANDEX_API_KEY
ENV VITE_YANDEX_GEOSUGGEST_KEY=$VITE_YANDEX_GEOSUGGEST_KEY

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
