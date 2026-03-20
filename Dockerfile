FROM node:22-slim AS builder
WORKDIR /app
RUN npm i -g pnpm@9
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
RUN pnpm install --frozen-lockfile --filter @grimoire/server...
RUN pnpm --filter @grimoire/server build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules
EXPOSE 3001
CMD ["node", "dist/index.js"]
