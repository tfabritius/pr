FROM node:14 AS builder
WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
COPY api/package.json api/
RUN yarn install --frozen-lockfile

COPY api api
RUN yarn api prisma generate
RUN yarn api build

#FROM node:14-alpine
#WORKDIR /app

#COPY package.json yarn.lock ./
#COPY api/package.json api/
#RUN yarn install --frozen-lockfile --production

#COPY --from=builder /app/api/dist ./api/dist

EXPOSE 3000

CMD yarn api prisma db push --preview-feature && yarn api prisma db seed --preview-feature && yarn api start:prod
