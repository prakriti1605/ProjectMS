# Stage 1: Build the Vite React production bundle
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm install

# Copy frontend source code
COPY . .

# Pass the backend API URL as a build argument for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build static assets (generates /dist folder)
RUN npm run build

# Stage 2: Serve static files using lightweight Nginx
FROM nginx:alpine

# Copy built dist files to Nginx public HTML folder
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA Routing: Fall back all sub-routes (/projects, /dashboard) to index.html
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Inform Docker that Nginx listens on port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]