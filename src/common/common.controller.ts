import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { RefreshTokenGuard } from './guards/bearer-token.guard';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('image')
  @UseGuards(RefreshTokenGuard)
  @UseInterceptors(FilesInterceptor('image', 10)) // 최대 10개 파일 허용
  uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
  ){
    // 받은 이미지들을 public/temp 에 저장
    return {
      images: files.map(file => file.filename)
    }
  }

}
