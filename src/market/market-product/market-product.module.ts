import { BadRequestException, Module } from '@nestjs/common';
import { MarketProductService } from './market-product.service';
import { MarketProductController } from './market-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketProductModel } from './entities/market-product.entity';
import { GuardsModule } from 'src/common/guards/guards.module';
import { UsersModule } from 'src/users/users.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import multer from 'multer';
import {v4 as uuid} from 'uuid'
import { MARKET_PRODUCT_IMAGE_PATH } from 'src/common/const/path.const';
import { MarketModel } from '../entities/market.entity';
import { MarketProductCategoryModel } from './entities/market-product-category.entity';
import { MarketProductQuery } from './queries/market-product.query';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketProductModel,
      MarketModel,
      MarketProductCategoryModel
    ]),
    GuardsModule,
    UsersModule,
    MulterModule.register({
      limits:{
        fileSize: 2300000, //byte 단위: 2.3MB
      },
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname); // .jpg 이런식으로 확장자 명만 가져옴
        if(ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png'){
          return callback( new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'), false);
        }
        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination: function(req, file, callback){ callback(null, MARKET_PRODUCT_IMAGE_PATH); },
        filename: function(rea, file, callback){ callback(null, `${uuid()}${extname(file.originalname)}`) }
      })
    }),
  ],
  controllers: [MarketProductController],
  providers: [MarketProductService, MarketProductQuery],
})
export class MarketProductModule {}
