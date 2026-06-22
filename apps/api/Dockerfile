# ==========================================
# STAGE 1: Build the TypeScript application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies needed for compiling prisma and node packages
RUN apk add --no-cache openssl

# Enable corepack to use pnpm (ver. 10.12.1 matching the workspace packageManager)
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# Increase Node.js heap size to prevent OOM errors during TypeScript compilation
# on low-memory VPS instances (e.g. AWS Lightsail 1GB RAM)
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy workspace settings and package.json files for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/

# Configure network resilience settings for reliable package installation
RUN pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000

# Install all dependencies (needed for compiling TS & contracts)
RUN pnpm install --frozen-lockfile --filter @nice-land/api...

# Copy the source code of the API and its dependent packages
COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts
COPY packages/database ./packages/database

# Build workspace projects in topological order
RUN pnpm --filter @nice-land/contracts build && \
    pnpm --filter @nice-land/database build && \
    pnpm --filter @nice-land/api build

# Deploy the @nice-land/api workspace app to a standalone production directory
# This generates a pruned node_modules with only production dependencies
RUN pnpm --filter @nice-land/api deploy --prod /usr/src/app/prod-api

# Manually copy the compiled dist files (not handled by pnpm deploy unless configured in files)
RUN cp -R apps/api/dist /usr/src/app/prod-api/dist

# Generate Prisma Client inside the production build's node_modules
# (uses the schema file located in the deployed database package dependencies)
WORKDIR /usr/src/app/prod-api
RUN npx prisma generate --schema=node_modules/@nice-land/database/prisma/schema.prisma

# ==========================================
# STAGE 2: Lightweight Production Runtime
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

# Set node environment to production
ENV NODE_ENV=production

# Copy the pre-packaged standalone api deployment from the builder stage
# (includes production dependencies, dist, and generated Prisma client)
COPY --from=builder /usr/src/app/prod-api ./

# Expose backend API port (default is 4000)
EXPOSE 4000

# Start the application directly with Node for minimum overhead
CMD ["node", "dist/server.js"]

