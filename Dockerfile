FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Arguments for build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PMA_URL
ARG NEXT_PUBLIC_WILDCARD_DOMAIN
ARG NEXT_PUBLIC_FILES_DOMAIN

# Set them as env variables so Next.js embeds them
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PMA_URL=$NEXT_PUBLIC_PMA_URL
ENV NEXT_PUBLIC_WILDCARD_DOMAIN=$NEXT_PUBLIC_WILDCARD_DOMAIN
ENV NEXT_PUBLIC_FILES_DOMAIN=$NEXT_PUBLIC_FILES_DOMAIN

RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
