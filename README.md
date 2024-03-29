## Getting started for development

### Preparation
- Install [NodeJs](https://nodejs.org/)
- Get access to a [PostgreSQL](https://www.postgresql.org/) database
  - [Install it locally](https://www.postgresql.org/download/)
  - Run [docker image](https://hub.docker.com/_/postgres)
  - Use a [cloud service](https://www.postgresql.org/support/professional_hosting/)
- Clone the repo

### Install and run backend
```bash
# Switch working directory
$ cd api

# Install dependencies
$ yarn install --frozen-lockfile

# Set `DATABASE_URL` environment variable or `api/.env`
$ DATABASE_URL="postgresql://user:password@host:5432/database"

# Run DB migrations (development mode, using shadow database)
$ yarn prisma migrate dev

# Run DB migrations (production mode, without shadow database)
$ yarn prisma migrate deploy

# Start backend in watch mode
$ yarn dev
```

The backend provides a SwaggerUI for the REST API on `/doc`.

### Install and run frontend

```bash
# Switch working directory
$ cd web

# Install dependencies
$ yarn install --frozen-lockfile

# Start frontend in watch mode
$ yarn dev
```

## Execute tests

### Backend

```bash
# lint
$ yarn lint

# unit tests
$ yarn api test

# e2e tests
$ yarn api test:e2e
```

### Frontend

```bash
# lint
$ yarn lint
```

## Build for single deployment

Backend and frontend are served from the same domain. `/` shows frontend, `/api` leads to backend.

```bash
# Build frontend
$ cd web
$ yarn build

# Build and run backend serving frontend
$ cd api
$ yarn build
$ SERVE_STATIC_PATH=../web/dist/ yarn start
```

## Build for separate deployment

Backend and frontend are served from different domains.

```bash
# Build and run backend - without serving frontend code
$ cd api
$ yarn build
$ yarn api start

# Build and serve frontend
$ cd web
$ VUE_APP_API_URL=http://localhost:3000/ yarn build
$ yarn serve
```

## Production

```bash
# Build docker image (backend)
$ docker build api/ -f api/Dockerfile

# Build docker image (backend + frontend)
$ docker build . -f Dockerfile
```

## Configuration parameters

All configuration parameters can be set via environment variables or using the respective `.env` files.

Backend Configuration is *not* relevant during build phase, only when actually running the code. In contrast, the frontend configuration *is* relevant during build phase and compiled into the build (i.e. cannot be changed afterwards).

### Backend (api)

```ini
# api/.env

# PostgreSQL database
DATABASE_URL=postgresql://user:password@host:5432/database

# E-mail address used as recipient in contact endpoint
CONTACT_RECIPIENT_EMAIL=me@example.com

# Transport configuration for sending emails, https://nodemailer.com/smtp/
# Default: use local sendmail (if available)
MAILER_TRANSPORT=smtps://username:password@smtp.example.com/

# URL of Portfolio Report instance used as proxy
PR_PROXY=https://api.portfolio-report.net

# Maximum score of results to be shown from fuzzy search
SECURITIES_SEARCH_MAX_SCORE=0.001

# Minimum number of results to be shown (independent from score)
SECURITIES_SEARCH_MIN_RESULTS=10

# Serve static files from this path under / and move api endpoints to /api
SERVE_STATIC_PATH=../web/dist

# Allowed period of inactivity for sessions in seconds
SESSION_TIMEOUT=86400

# Token to download GeoIP database from www.ip2location.com (optional)
IP2LOCATION_TOKEN=...
```

### Frontend (web)

```ini
# web/.env

# URL to API
VUE_APP_API_URL=http://localhost:3000/
```

## Recommended VSCode settings

To be placed in `.vscode/settings.json`.

```jsonc
{
  // Use separate working directories
  "eslint.workingDirectories": [
    "./api",
    "./web",
  ]

  "editor.codeActionsOnSave": {
    // Fix eslint issues on save
    "source.fixAll.eslint": true
  },

  // Disable vue template validation by vetur, validated by eslint.
  // Vetur uses eslint-plugin-vue but doesn't pick up .eslintrc.js.
  "vetur.validation.template": false
}
```
