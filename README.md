## Development

### Configure backend

```ini
# api/.env

# Postgres database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Serve static files under / and move api endpoints to /api
SERVE_STATIC = false

# Allowed period of inactivity for sessions in seconds
SESSION_TIMEOUT = 86400
```

### Installation

```bash
# Install dependencies
$ yarn install --frozen-lockfile

# Run pending database migrations
$ yarn api typeorm -- migration:run --transaction=each

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
