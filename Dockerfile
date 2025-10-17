# --- STAGE 1: Dependency Installation ---
FROM node:22-alpine AS deps
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
FROM node:22-alpine AS builder
WORKDIR /app
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ----------------------------------------------------
# FIX: Explicitly define build ARGs and map them to ENVs.
# This ensures that all required VITE_ variables passed by EasyPanel 
# (as build arguments) are exposed to the build process for bundling.
# ----------------------------------------------------

# Supabase Configuration
ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# reCAPTCHA Configuration
ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

# Cube.js Configuration
ARG VITE_CUBE_API_URL
ENV VITE_CUBE_API_URL=$VITE_CUBE_API_URL
ARG VITE_CUBE_API_TOKEN
ENV VITE_CUBE_API_TOKEN=$VITE_CUBE_API_TOKEN
ARG VITE_CUBE_QUERY
ENV VITE_CUBE_QUERY=$VITE_CUBE_QUERY
ARG VITE_CUBE_PIVOT_CONFIG
ENV VITE_CUBE_PIVOT_CONFIG=$VITE_CUBE_PIVOT_CONFIG
ARG VITE_CHART_TYPE
ENV VITE_CHART_TYPE=$VITE_CHART_TYPE
ARG VITE_CUBE_API_USE_WEBSOCKETS
ENV VITE_CUBE_API_USE_WEBSOCKETS=$VITE_CUBE_API_USE_WEBSOCKETS
ARG VITE_CUBE_API_USE_SUBSCRIPTION
ENV VITE_CUBE_API_USE_SUBSCRIPTION=$VITE_CUBE_API_USE_SUBSCRIPTION
ARG VITE_CUBE_CACHE_TIME
ENV VITE_CUBE_CACHE_TIME=$VITE_CUBE_CACHE_TIME

# Matomo Configuration
ARG VITE_MATOMO_URL
ENV VITE_MATOMO_URL=$VITE_MATOMO_URL


# Set production environment flag
ENV NODE_ENV=production

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
