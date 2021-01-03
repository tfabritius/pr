## Development

### Configure backend

```ini
# api/.env

# Postgres database
DATABASE_URL = "postgresql://user:password@host:5432/database"

# Serve static files from this path under / and move api endpoints to /api
SERVE_STATIC_PATH = "../web/dist"

# Allowed period of inactivity for sessions in seconds
SESSION_TIMEOUT = 86400
```

### Configure frontend

```ini
# web/.env

# URL to API
VUE_APP_API_URL = http://localhost:3000/
```

### Installation

```bash
# Install dependencies
$ yarn install --frozen-lockfile

# Run pending database migrations
$ yarn api typeorm migration:run --transaction=each

# Start backend in watch mode
$ yarn api start:dev

# Start frontend in watch mode
$ yarn web serve
```

## Test

```bash
# lint
$ yarn lint

# unit tests
$ yarn api test

# e2e tests
$ yarn api test:e2e
```

## Production

```bash
# Build docker image (backend)
docker build . -f api/Dockerfile

# Build docker image (backend + frontend)
docker build . -f Dockerfile
```
