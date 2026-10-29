# ---- base: shared runtime ----
FROM node:24-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- test: all dependencies + tests ----
FROM base AS test
ENV NODE_ENV=test
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npx", "jest", "--runInBand"]

# ---- production: runtime dependencies only ----
FROM base AS production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node index.js ./
COPY --chown=node:node src ./src
USER node
EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/health || exit 1
# Apply pending migrations, then start the API
CMD ["sh", "-c", "node src/db/migrate.js && node index.js"]
