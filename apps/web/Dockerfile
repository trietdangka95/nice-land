FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/api-client/package.json packages/api-client/package.json
RUN pnpm install --frozen-lockfile --filter @nice-land/web...

FROM dependencies AS build
COPY apps/web apps/web
COPY packages/contracts packages/contracts
COPY packages/api-client packages/api-client
RUN pnpm --filter @nice-land/contracts build
RUN pnpm --filter @nice-land/api-client build
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @nice-land/web build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=3002
WORKDIR /app
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3002
CMD ["node", "apps/web/server.js"]
