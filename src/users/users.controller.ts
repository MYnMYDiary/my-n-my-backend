import { Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserModel } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { RefreshTokenGuard } from 'src/common/guards/bearer-token.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 유저 정보 조회 - 내 정보 조회
   * @param userId 유저 아이디
   * @returns 유저 정보
   */
  @Get('me')
  @UseGuards(RefreshTokenGuard)
  getMyInfo(@Req() request: any) {
    // 유저 아이디
    const userId = request.user.id;
    return this.usersService.getMyInfo(userId);
  }


  /**
   * 유저 생성
   * @param user 유저 정보
   * @returns 생성된 유저 정보
   */
  @Post()
  posrUser(
    @Body('user') user : Pick<UserModel,'email'|'password'|'nickname' >,
  ){
    return this.usersService.createUser(user);
  }

  /**
   * 프로필 이미지 업로드
   * @param file 업로드된 이미지 파일
   * @returns 업로드된 이미지 파일 경로
   */
  @Post('image')
  @UseGuards(RefreshTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: any,
  ){
    // 유저 아이디
    const userId = request.user.id;
    this.usersService.uploadProfileImage(userId, file.filename);

    return {
      message: '프로필 이미지 업로드 성공',
      fileName: file.filename,
    }
  }


}
