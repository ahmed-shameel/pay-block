# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S payblock && adduser -S payblock -G payblock

COPY --from=builder --chown=payblock:payblock /app/.next/standalone ./
COPY --from=builder --chown=payblock:payblock /app/.next/static ./.next/static
COPY --from=builder --chown=payblock:payblock /app/public ./public

USER payblock

EXPOSE 3000
CMD ["node", "server.js"]
