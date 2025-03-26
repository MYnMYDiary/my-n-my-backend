// nest g resource로 폴더를 만들 수 있다
import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Req, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { AccessTokenGuard, RefreshTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginateDiaryDto } from './dto/pagenate-diary.dto';
import { UserModel } from 'src/users/entities/user.entity';
import { MyDiaryDto } from './dto/mydiary.dto';



@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get()
  getDiarys(
    @Query() query: PaginateDiaryDto,
    @Body('categoryId') categoryId:string
  ) {
    return this.diaryService.getAllDiary(query, categoryId);
  }

  
  @Get(':id')
  getDiary(@Param('id', ParseIntPipe ) id: number){

    return this.diaryService.getDiaryById(id);
  }

  @Get('mydiary/:id')
  @UseGuards(RefreshTokenGuard)
  getMyDiary(
    @Req() request:any,
    @Param('id', ParseIntPipe) diaryId: number
  ){
    const userId = request.user.id;
    return this.diaryService.getMyDiaryById(userId, diaryId);
  }

  @Post('mydiary')
  @UseGuards(RefreshTokenGuard)
  postDiaryByUser(
    @Req() request:any,
    @Query() query: PaginateDiaryDto,
    @Body() filter: MyDiaryDto
  ){
    const userId = request.user.id;
    return this.diaryService.getMyDiary(userId, filter, query);
  }


  @Post()
  @UseGuards(AccessTokenGuard)
  async postDiary(
    @User('id') userId: number,
    @Body() diary: CreateDiaryDto,
  ){
    await this.diaryService.createDiaryImage(diary);
    return this.diaryService.uploadDiary(userId, diary);
  }


  //테스트
  @Post('test')
  @UseGuards(AccessTokenGuard)
  async testpostDiary(
    @User() user: UserModel,
  ){
    await this.diaryService.generateDiary(user.id);
    return {
      message: '테스트 값 생성 완료'
    }
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
