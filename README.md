## Getting started for development

### Preparation
- Install [NodeJs](https://nodejs.org/)
- Get access to a [PostgreSQL](https://www.postgresql.org/) database
  - [Install it locally](https://www.postgresql.org/download/)
  - Run [docker image](https://hub.docker.com/_/postgres)
  - Use a [cloud service](https://www.postgresql.org/support/professional_hosting/)
- Clone the repo

### Install and run
```bash
# Install dependencies
$ yarn install --frozen-lockfile

# Set `DATABASE_URL` environment variable or `api/.env`
$ DATABASE_URL="postgresql://user:password@host:5432/database"

# Push schema to DB
$ yarn api prisma db push --preview-feature

# Seed DB
$ yarn api prisma db seed --preview-feature

# Start backend in watch mode
$ yarn api dev

# Start frontend in watch mode
$ yarn web dev
```

The backend provides a SwaggerUI for the REST API on `/doc`.

## Executing tests

```bash
# lint
$ yarn lint

# unit tests
$ yarn api test

# e2e tests
$ yarn api test:e2e
```


## Build for single deployment

Backend and frontend are served from the same domain. `/` shows frontend, `/api` leads to backend.

```bash
# Build backend
$ yarn api build

# Build frontend
$ yarn web build

# Run backend and serve frontend
$ SERVE_STATIC_PATH=../web/dist/ yarn api start
```

## Build for separate deployment

Backend and frontend are served from different domains.

```bash
# Build backend
$ yarn api build

# Build frontend
$ VUE_APP_API_URL=http://localhost:3000/ yarn web build

# Run backend - without serving frontend code
$ yarn api start

# Serve frontend
$ yarn web serve
```

## Production

```bash
# Build docker image (backend)
$ docker build . -f api/Dockerfile

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
DATABASE_URL="postgresql://user:password@host:5432/database"

# E-mail address used as recipient in contact endpoint
CONTACT_RECIPIENT_EMAIL="me@example.com"

# Transport configuration for sending emails, https://nodemailer.com/smtp/
# Default: use local sendmail (if available)
MAILER_TRANSPORT="smtps://username:password@smtp.example.com/"

# Serve static files from this path under / and move api endpoints to /api
SERVE_STATIC_PATH="../web/dist"

# Allowed period of inactivity for sessions in seconds
SESSION_TIMEOUT=86400

# Token to download GeoIP database from www.ip2location.com (optional)
IP2LOCATION_TOKEN="..."
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
  "editor.codeActionsOnSave": {
    // Fix eslint issues on save
    "source.fixAll.eslint": true
  },

  // Disable vue template validation by vetur, validated by eslint.
  // Vetur uses eslint-plugin-vue but doesn't pick up .eslintrc.js.
  "vetur.validation.template": false
}
```
