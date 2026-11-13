# 1. Base image with Alpine Node 22 & Corepack pnpm
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 2. Dependencies stage (Install all monorepo dependencies for build)
FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

# 3. Builder stage (Generate Prisma client & compile NestJS)
FROM base AS builder
COPY --from=dependencies /app /app
COPY packages/shared-types ./packages/shared-types
COPY apps/api/src ./apps/api/src
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/tsconfig*.json apps/api/nest-cli.json* ./apps/api/

WORKDIR /app/apps/api
RUN pnpm exec prisma generate
RUN pnpm run build

# 4. Production Runner stage
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# 보안을 위해 non-root node 유저 권한 부여
USER node

# 빌드 결과물 및 필수 런타임 의존성 복사 (Prisma Client가 생성된 builder 스테이지에서 복사)
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --chown=node:node --from=builder /app/packages/shared-types ./packages/shared-types
COPY --chown=node:node --from=builder /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --chown=node:node --from=builder /app/apps/api/package.json ./apps/api/package.json

ENV NODE_PATH=/app/node_modules:/app/apps/api/node_modules

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["sh", "-c", "if [ -f dist/src/main.js ]; then node dist/src/main.js; else node dist/main.js; fi"]
