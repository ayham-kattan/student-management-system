# ---- build: compile the React app to static files ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Reuse downloaded packages between builds (BuildKit cache), so a lockfile change doesn't refetch everything.
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit --no-fund
COPY . .
# Empty API URL: the app calls /api on its own origin and nginx forwards it.
ENV REACT_APP_API_URL= \
    REACT_APP_ENV=docker \
    GENERATE_SOURCEMAP=false
RUN npm run build

# ---- production: serve with nginx ----
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
