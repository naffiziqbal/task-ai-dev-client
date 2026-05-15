FROM node:20-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

COPY . .
RUN pnpm build

FROM node:20-bookworm-slim AS runtime
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]
