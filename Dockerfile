FROM node:14 AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY api/package.json api/
COPY web/package.json web/
RUN yarn install --frozen-lockfile

COPY api api
RUN yarn api build

COPY web web
RUN yarn web build

FROM node:14-alpine
WORKDIR /app

COPY package.json yarn.lock ./
COPY api/package.json api/
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/web/dist ./web/dist

EXPOSE 3000
ENV SERVE_STATIC_PATH "../web/dist"

CMD yarn api start:prod
