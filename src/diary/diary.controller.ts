// nest g resource로 폴더를 만들 수 있다
import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Request, UseGuards } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { UserModel } from 'src/users/entities/user.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreateDiaryDto } from './dto/create-diary.dto';


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
  @UseGuards(AccessTokenGuard)
  postDiary(
    @User('id') userId: number,
    @Body() diary: CreateDiaryDto,
    @Body('categoryId') categoryId: string,
  ){
    return this.diaryService.uploadDiary(userId, categoryId, diary);
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
