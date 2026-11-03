FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

FROM base AS build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm db:generate && pnpm build

FROM build AS prod-deps

RUN pnpm prune --prod

FROM node:24-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY --chown=node:node package.json ./
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 3333

CMD ["node", "dist/server.js"]