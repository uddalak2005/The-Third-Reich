# ────────────────────────────────────────────────
# Stage 1 – Build
# ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for the build)
RUN npm ci

# Copy the rest of the source
COPY . .

# Build the production bundle (output → /app/dist)
RUN npm run build

# ────────────────────────────────────────────────
# Stage 2 – Serve
# ────────────────────────────────────────────────
FROM nginx:stable-alpine AS runner

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config — handles SPA client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the same port the Vite dev server uses
EXPOSE 8080

# Nginx starts automatically; no extra commands required
CMD ["nginx", "-g", "daemon off;"]
