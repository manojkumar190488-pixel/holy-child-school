# ===========================================================================
# OpportunityIQ Frontend - Multi-Stage Dockerfile
# Next.js 14 with standalone output for minimal production image
# ===========================================================================

# ---------------------------------------------------------------------------
# Stage 1: deps - install dependencies only
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Install libc6-compat for Alpine compatibility with some native modules
RUN apk add --no-cache libc6-compat

# Copy package manifests and install with clean install (ci)
COPY package*.json ./
RUN npm ci --ignore-scripts

# ---------------------------------------------------------------------------
# Stage 2: builder - compile the Next.js application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Set build-time env vars (non-secret public values)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js app (outputs .next/standalone due to output: 'standalone')
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: runner - minimal production runtime image
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone build output
COPY --from=builder /app/.next/standalone ./

# Copy static assets (these are not included in standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public directory (images, icons, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# The standalone build produces a self-contained server.js at the root
CMD ["node", "server.js"]
