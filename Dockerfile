# syntax=docker/dockerfile:1.7

FROM node:25-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY contracts/package.json contracts/package.json
COPY frontend/package.json frontend/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS frontend-builder

WORKDIR /app

ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

COPY backend backend
COPY contracts contracts
COPY frontend frontend

RUN pnpm --filter frontend build

FROM base AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY contracts/package.json contracts/package.json
COPY frontend/package.json frontend/package.json

RUN pnpm install --prod --frozen-lockfile --filter backend...

COPY backend backend
COPY contracts contracts
COPY --from=frontend-builder /app/frontend/dist frontend/dist

EXPOSE 3000

CMD ["pnpm", "--filter", "backend", "start"]
