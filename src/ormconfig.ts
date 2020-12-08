import { ConnectionOptions } from 'typeorm'
import 'dotenv/config'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

const ormConfig: ConnectionOptions = {
  namingStrategy: new SnakeNamingStrategy(),

  type: 'postgres',

  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'pr-api',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'pr-api',

  // use .ts in development, compiled .js in production
  entities: [__dirname + '/**/*.entity{.ts,.js}'],

  logging: process.env.DB_LOGGING === 'true',

  synchronize: process.env.DB_SYNC === 'true',

  migrations: [__dirname + '/_migrations/**/*{.ts,.js}'],
  migrationsRun: false,
  migrationsTableName: '_migrations',
  cli: {
    migrationsDir: 'src/_migrations',
  },
}

export = ormConfig
