import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { MailService } from './mail.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    //JWT 토큰 사용 signing을 할 때 넣어주도록!
    JwtModule.register({}), 
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    MailService,
  ],
})
export class AuthModule {}
