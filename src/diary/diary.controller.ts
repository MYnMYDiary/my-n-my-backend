// nest g resource로 폴더를 만들 수 있다
import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { FileInterceptor } from '@nestjs/platform-express';


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
  @UseInterceptors(FileInterceptor('image'))
  async postDiary(
    @User('id') userId: number,
    @Body('categoryId') categoryId: string,
    @Body() diary: CreateDiaryDto,
    // @UploadedFile() file: Express.Multer.File,
  ){
    await this.diaryService.createDiaryImage(diary);
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
