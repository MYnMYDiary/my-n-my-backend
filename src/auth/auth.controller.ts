import { Body, Controller, Get, Header, Headers, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModel } from 'src/users/entities/user.entity';
import { MailService } from './mail.service';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService
  ) {}

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  createTokenAccess(
    @Headers('authorization') rawToken: string,
    @Req() request: Request,
  ){
    const refreshToken = request.cookies?.refreshToken; // 쿠키에서 RefreshToken 가져오기
    const newToken = this.authService.rotateToken(refreshToken, false) // accessToken 발급

    return{ accessToken: newToken }
  }


  // 근데 보통 refreshToken은 재발급 하지 않고 다시 로그인해야함 => Guare -> verifyToken()
  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  createTokenRefresh(
    @Headers('authorization') rawToken: string,
    @Req() request: Request,
  ){
    const refreshToken = request.cookies?.refreshToken; // 쿠키에서 RefreshToken 가져오기
    const newToken = this.authService.rotateToken(refreshToken, true) // refreshToken 발급

    return{ refreshToken: newToken }
  }

  @Post('login/email')
  async loginEmail(
    // @Headers('authorization') rawToken: string, => BasicToken 사용 시
    @Body('user') user: Pick<UserModel,'email'|'password' >,
    @Res() res: Response,
  ) {
    return await this.authService.loginWithEmail(user, res);
  }

  @Post('join/email')
  joinEmail(
    @Body('user') user: Pick<UserModel,'email'|'password'|'nickname' >,
    @Res() res: Response,
  ) {
    return this.authService.joinWithEmail(user, res);
  }

  @Get('send-email')
  async sendTestMail(@Query('email') email: string) {
    return this.mailService.sendVerificationEmail(email);
  }

  @Post('send-email')
  async sendEmail(@Body('email') email: string) {
      return await this.mailService.sendVerificationEmail(email);
  }

  @Post('verify-email')
  async verifyCode(@Body('email') email: string, @Body('code') code: string) {
      return await this.mailService.verifyEmailCode(email, code);
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response){
    // 클라이언트 쿠키 삭제
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
  });

  return res.json({ message: '로그아웃 성공' });
  }

}
