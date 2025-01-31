import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryModel } from './entities/diary.entity';
import { SpaceModel } from './entities/space.entity';
import { CategoryModel } from './entities/category.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      DiaryModel,
      SpaceModel,
      CategoryModel,
    ]),
    AuthModule
  ],
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule {}
