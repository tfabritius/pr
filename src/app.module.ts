import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import * as ormconfig from './ormconfig'

import { AuthModule } from './auth/auth.module'
import { CurrenciesModule } from './currencies/currencies.module'
import { PortfoliosModule } from './portfolios/portfolios.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(ormconfig),
    AuthModule,
    CurrenciesModule,
    PortfoliosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
