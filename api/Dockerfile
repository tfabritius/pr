FROM node:14 AS builder
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM node:14-alpine
WORKDIR /app

COPY package*.json ./
RUN yarn install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD npm run typeorm:prod -- migration:run --transaction=each && npm run start:prod
