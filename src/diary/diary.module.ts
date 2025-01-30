import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryModel } from './entities/diary.entity';
import { SpaceModel } from './entities/space.entity';
import { CategoryModel } from './entities/category.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      DiaryModel,
      SpaceModel,
      CategoryModel,
    ])
  ],
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule {}
