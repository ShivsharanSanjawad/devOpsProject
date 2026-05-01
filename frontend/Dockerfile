# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_BASE_URL=http://localhost:8080/api
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

# ---- Serve Stage ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback: serve index.html for all routes
RUN printf 'server {\n  listen 80;\n  location / {\n    root /usr/share/nginx/html;\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
