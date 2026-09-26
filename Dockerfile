# Production image: one long-lived Node process (Atlas runs its work in the
# server process, so serverless platforms are not suitable).
FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app /app
RUN mkdir -p /app/storage
EXPOSE 3000
# Applies pending database migrations, then starts the server.
CMD ["sh", "-c", "pnpm db:migrate && pnpm start -p 3000"]
