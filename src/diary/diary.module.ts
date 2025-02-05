import { DIARY_IMAGE_PATH } from './../common/const/path.const';
import { BadRequestException, Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryModel } from './entities/diary.entity';
import { SpaceModel } from './entities/space.entity';
import { CategoryModel } from './entities/category.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import multer from 'multer';
import {v4 as uuid} from 'uuid'

@Module({
  imports:[
    TypeOrmModule.forFeature([
      DiaryModel,
      SpaceModel,
      CategoryModel,
    ]),
    AuthModule,
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
        destination: function(req, file, callback){ callback(null, DIARY_IMAGE_PATH); },
        filename: function(rea, file, callback){ callback(null, `${uuid()}${extname(file.originalname)}`) }
      })
    }),
  ],
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule {}
