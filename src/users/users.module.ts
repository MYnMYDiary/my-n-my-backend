import { BadRequestException, forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import multer from 'multer';
import { PROFILE_IMAGE_PATH } from 'src/common/const/path.const';
import {v4 as uuid} from 'uuid'
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([UserModel]),
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
        destination: function(req, file, callback){ callback(null, PROFILE_IMAGE_PATH); },
        filename: function(rea, file, callback){ callback(null, `${uuid()}${extname(file.originalname)}`) }
      })
    }),
    forwardRef(() => AuthModule)
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[UsersService],
})
export class UsersModule {}
