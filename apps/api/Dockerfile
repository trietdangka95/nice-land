FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --frozen-lockfile --filter @nice-land/api...

FROM dependencies AS build
COPY apps/api apps/api
COPY packages/contracts packages/contracts
COPY packages/database packages/database
RUN pnpm --filter @nice-land/contracts build
RUN pnpm --filter @nice-land/database build
RUN pnpm --filter @nice-land/api build
RUN pnpm --filter @nice-land/api deploy --prod /prod/api
RUN cp -R apps/api/dist /prod/api/dist

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /prod/api ./
USER node
EXPOSE 4000
CMD ["node", "dist/server.js"]
