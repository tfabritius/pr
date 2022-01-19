FROM node:16

WORKDIR /app

# Only re-run install if package files have changed
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the app
COPY . .

ARG VUE_APP_API_URL=https://api.portfolio-report.net/

# Build app
RUN yarn build
