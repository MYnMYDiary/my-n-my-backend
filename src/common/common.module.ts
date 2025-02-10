import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import multer from 'multer';
import { DIARY_IMAGE_PATH, TEMP_FOLDER_PATH } from './const/path.const';
import {v4 as uuid} from 'uuid'
import { AuthModule } from 'src/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports:[
    ScheduleModule.forRoot(), //크론 스케쥴링 활성화
    //이미지 업로드
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
        destination: function(req, file, callback){ callback(null, TEMP_FOLDER_PATH); },
        filename: function(rea, file, callback){ callback(null, `${uuid()}${extname(file.originalname)}`) }
      })
    }),
    AuthModule
  ],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
