import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { MarketModel } from './entities/market.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardsModule } from 'src/common/guards/guards.module';
import { UsersModule } from 'src/users/users.module';
import { MarketSubscribeModel } from './entities/market-subscribe.entity';
import { MarketSubscribeQuery } from './queries/market-subscribe.query';
import { MarketProductModule } from './market-product/market-product.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketModel,
      MarketSubscribeModel
    ]),
    GuardsModule,
    UsersModule,
    MarketProductModule,
  ],
  exports: [MarketService],
  controllers: [MarketController],
  providers: [MarketService, MarketSubscribeQuery],
})
export class MarketModule {}
