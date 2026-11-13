# 1. Base image with Alpine Node 22 & Corepack pnpm
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 2. Dependencies stage (Install all monorepo dependencies)
FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

# 3. Builder stage (Build Vite SPA production bundle)
FROM base AS builder
COPY --from=dependencies /app /app
COPY packages/shared-types ./packages/shared-types
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/index.html apps/web/vite.config.ts apps/web/tsconfig*.json apps/web/tailwind.config.* apps/web/postcss.config.* ./apps/web/

WORKDIR /app/apps/web
RUN pnpm run build

# 4. Production Runner stage with Nginx Alpine
FROM nginx:alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
