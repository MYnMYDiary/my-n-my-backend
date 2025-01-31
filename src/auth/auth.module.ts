import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { MailService } from './mail.service';
import { CacheModule } from '@nestjs/cache-manager';
import { AccessTokenGuard } from './guard/bearer-token.guard';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    //JWT 토큰 사용 signing을 할 때 넣어주도록!
    JwtModule.register({}), 
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [ AuthService, MailService,AccessTokenGuard,],
  exports: [AuthService, AccessTokenGuard, UsersModule],
})
export class AuthModule {}
