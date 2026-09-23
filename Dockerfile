from node:22-alpine as builder
workdir /app
copy package.json pnpm-lock.yaml ./
run corepack enable && corepack prepare pnpm@latest --activate
run pnpm install --prod --frozen-lockfile --ignore-scripts

from node:22-alpine
workdir /app
copy package.json ./
copy --from=builder /app/node_modules ./node_modules
copy dist ./dist
copy .env ./.env
expose 3000
cmd ["node", "dist/server.js"]