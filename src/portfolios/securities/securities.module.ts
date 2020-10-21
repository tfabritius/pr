import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Security } from './security.entity'

@Module({ imports: [TypeOrmModule.forFeature([Security])] })
export class SecuritiesModule {}
