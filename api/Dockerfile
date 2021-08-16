FROM node:16 AS builder
WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn prisma generate
RUN yarn build

FROM node:16-alpine
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/prisma ./prisma
RUN yarn prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD yarn prisma migrate deploy && yarn start:prod
