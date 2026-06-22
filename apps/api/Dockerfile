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

# Generate Prisma Client in the BUILD workspace (prisma CLI devDep is available here)
RUN pnpm --filter @nice-land/database exec prisma generate

# Deploy the @nice-land/api workspace app to a standalone production directory
# --legacy flag required for pnpm v10+ without inject-workspace-packages
RUN pnpm --filter @nice-land/api deploy --legacy --prod /usr/src/app/prod-api

# Manually copy the compiled dist files (not handled by pnpm deploy)
RUN cp -R apps/api/dist /usr/src/app/prod-api/dist

# Copy the generated .prisma/client directory from pnpm virtual store into prod-api.
# Without this, @prisma/client falls back to its CJS stub.
RUN find /usr/src/app/node_modules/.pnpm -name ".prisma" -type d 2>/dev/null | head -1 | \
    xargs -I{} cp -R {} /usr/src/app/prod-api/node_modules/ && \
    echo "Prisma client copied to prod-api"

# Dereference all pnpm symlinks in prod-api to create a fully self-contained directory.
# pnpm deploy --prod creates symlinks pointing to its virtual store (.pnpm/).
# When copied to Stage 2 (runner), those symlinks become broken since the .pnpm store
# is not copied over. cp -rL follows and resolves all symlinks into real file copies.
RUN cp -rL /usr/src/app/prod-api /usr/src/app/prod-api-final

# ==========================================
# STAGE 2: Lightweight Production Runtime
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

# Set node environment to production
ENV NODE_ENV=production

# Copy the dereferenced (symlink-free) production deployment from builder
COPY --from=builder /usr/src/app/prod-api-final ./

# Expose backend API port (default is 4000)
EXPOSE 4000

# Start the application directly with Node for minimum overhead
CMD ["node", "dist/server.js"]

