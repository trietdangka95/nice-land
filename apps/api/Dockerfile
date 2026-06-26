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

# Install all dependencies (including devDeps needed for TS compilation + prisma CLI)
RUN pnpm install --frozen-lockfile --filter @nice-land/api...

# Copy the source code of the API and its dependent packages
COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts
COPY packages/database ./packages/database

# Build workspace projects in topological order
RUN pnpm --filter @nice-land/contracts build && \
    pnpm --filter @nice-land/database build && \
    pnpm --filter @nice-land/api build

# Generate Prisma Client while prisma CLI devDep is still available
RUN pnpm --filter @nice-land/database exec prisma generate

# ==========================================
# STAGE 2: Lightweight Production Runtime
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

# Set node environment to production
ENV NODE_ENV=production

# Copy the entire pnpm node_modules from builder.
# This includes the pnpm virtual store (.pnpm/) with real package files
# and all workspace symlinks. Copying everything avoids broken symlinks
# and ensures @prisma/client and all transitive deps resolve correctly.
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy built workspace packages (dist files only — no source code)
COPY --from=builder /usr/src/app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /usr/src/app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=builder /usr/src/app/packages/database/dist ./packages/database/dist
COPY --from=builder /usr/src/app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /usr/src/app/packages/database/prisma ./packages/database/prisma

# Copy the compiled API application
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=builder /usr/src/app/apps/api/package.json ./apps/api/package.json

# Copy root workspace manifests (needed for pnpm workspace resolution)
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Expose backend API port
EXPOSE 4000

# Run from apps/api so relative module resolution works correctly
WORKDIR /usr/src/app/apps/api
CMD ["node", "dist/server.js"]
