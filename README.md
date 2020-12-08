## Installation

```bash
$ npm install
```

## Configuration

Postgresql connection
```bash
DB_HOST = localhost
DB_PORT = 5432
DB_USER = username
DB_PASS = password
DB_NAME = database
```

Serve static files
```bash
SERVE_STATIC = true
```
- Api endpoints will move to `/api` subfolder
- Files from folder `/static` will be served on URLs except `/api`, e.g. frontend

## Prepare the database
```bash
# run pending migrations
$ npm run typeorm -- migration:run --transaction=each

# revert last migration
$ npm run typeorm migration:revert

# clean up ;-)
$ npm run typeorm schema:drop
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
