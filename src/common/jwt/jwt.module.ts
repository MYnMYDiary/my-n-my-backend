import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt.service';

@Module({
  imports: [
    JwtModule.register({}),
  ],
  providers: [
    JwtAuthService,
  ],
  exports: [
    JwtAuthService,
    JwtModule,
  ],
})
export class JwtAuthModule {} 