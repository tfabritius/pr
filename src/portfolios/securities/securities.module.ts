import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Security } from './security.entity'
import { SecuritiesService } from './securities.service'

@Module({
  imports: [TypeOrmModule.forFeature([Security])],
  providers: [SecuritiesService],
})
export class SecuritiesModule {}
