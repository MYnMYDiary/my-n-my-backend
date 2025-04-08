import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { MailService } from './mail.service';
import { CacheModule } from '@nestjs/cache-manager';
import { GuardsModule } from 'src/common/guards/guards.module';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    GuardsModule,
  ],
  controllers: [AuthController],
  providers: [ 
    AuthService, 
    MailService,
  ],
  exports: [
    AuthService,
  ],
})
export class AuthModule {}
