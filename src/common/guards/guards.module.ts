import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AccessTokenGuard } from './bearer-token.guard';
import { OptionalBearerTokenGuard } from './optional-token.guard';
import { RefreshTokenGuard } from './bearer-token.guard';

@Module({
  imports: [
    UsersModule,
  ],
  providers: [
    AccessTokenGuard,
    OptionalBearerTokenGuard,
    RefreshTokenGuard,
  ],
  exports: [
    AccessTokenGuard,
    OptionalBearerTokenGuard,
    RefreshTokenGuard,
  ],
})
export class GuardsModule {} 