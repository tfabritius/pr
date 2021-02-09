import { ConnectionOptions } from 'typeorm'
import 'dotenv/config'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

const ormConfig: ConnectionOptions = {
  namingStrategy: new SnakeNamingStrategy(),

  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://pr:password@localhost:5432/pr',

  // use .ts in development, compiled .js in production
  entities: [__dirname + '/**/*.entity{.ts,.js}'],

  logging: process.env.DB_LOGGING === 'true',
}

export = ormConfig
