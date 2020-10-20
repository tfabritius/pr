import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from './users/users.module'

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [UsersModule],
})
export class AuthModule {}
