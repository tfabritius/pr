import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { AuthModule } from './auth/auth.module'
import { CurrenciesModule } from './currencies/currencies.module'
import { PortfoliosModule } from './portfolios/portfolios.module'
import { StatsModule } from './stats/stats.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      sortSchema: true,
      playground: process.env.NODE_ENV === 'development',
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', process.env.SERVE_STATIC_PATH || ''),
      exclude: process.env.SERVE_STATIC_PATH ? ['/api/*'] : ['*'],
      serveStaticOptions: { fallthrough: true },
    }),
    AuthModule,
    CurrenciesModule,
    PortfoliosModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
