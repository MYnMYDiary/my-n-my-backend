// nest g resource로 폴더를 만들 수 있다
import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { UserModel } from 'src/users/entities/user.entity';


@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get()
  getDiarys() {
    return this.diaryService.getAllDiary();
  }

  
  @Get(':id')
  getDiary(@Param('id', ParseIntPipe ) id: number){

    return this.diaryService.getDiaryById(id);
  }


  @Post()
  postDiary(
    @Body('user_id' ) userId : number,
    @Body('title') title : string,
    @Body('content') content : string,
    @Body('categoryId') categoryId: string,
  ){
    return this.diaryService.uploadDiary(userId,categoryId, title, content);
  }


  @Put(':id')
  putDiary(
    @Param('id', ParseIntPipe) id : number,
    @Body('title') title ?: string,
    @Body('content') content ?: string ){

      return this.diaryService.editDaiary(id, title ?? '', content ?? '');

  }

  @Delete(':id')
  deleteDiary(@Param('id', ParseIntPipe) id : number){
    return this.diaryService.deleteDiary(id);
  }

}
