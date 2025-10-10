# --- STAGE 1: Dependency Installation ---
FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# --- STAGE 2: Build Application ---
FROM node:18-alpine AS builder
WORKDIR /app
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ----------------------------------------------------
# REMOVED: Explicit ARG/ENV mapping for VITE_API_URL.
# We assume EasyPanel passes environment variables defined
# in its UI as build arguments (e.g., VITE_API_URL).

# Set production environment flag
ENV NODE_ENV=production

# NOTE for Vite: Vite automatically picks up environment variables 
# prefixed with VITE_ that are present during the `npm run build` step,
# either from the shell environment or from build arguments (which EasyPanel uses).
# Ensure your variables in EasyPanel are prefixed with VITE_ (e.g., VITE_API_URL).

# ----------------------------------------------------

# Run the Vite build command
# The output will be in the 'dist' folder by default.
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# --- STAGE 3: Production Runner (Nginx) ---
# Use a lightweight Nginx image to serve static files efficiently
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Expose Nginx default HTTP port
EXPOSE 80

# Copy the custom Nginx configuration file
# This file contains the crucial `try_files` rule for SPA client-side routing.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets from the builder stage
COPY --from=builder /app/dist .

# Set default command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
