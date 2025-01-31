import { Body, Controller, Get, Header, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModel } from 'src/users/entities/user.entity';
import { MailService } from './mail.service';
import { RefreshTokenGuard } from './guard/bearer-token.guard';

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
  ){
    const token = this.authService.extractTokenFromHeader(rawToken, true) //Bearer토큰
    const newToken = this.authService.rotateToken(token, false) // accessToken 발급

    return{ accessToken: newToken }
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  createTokenRefresh(
    @Headers('authorization') rawToken: string,
  ){
    const token = this.authService.extractTokenFromHeader(rawToken, true) //Bearer토큰
    const newToken = this.authService.rotateToken(token, true) // refreshToken 발급

    return{ refreshToken: newToken }
  }

  @Post('login/email')
  loginEmail(
    // @Headers('authorization') rawToken: string, => BasicToken 사용 시
    @Body('user') user: Pick<UserModel,'email'|'password' >,
  ) {
    // const token= this.authService.extractTokenFromHeader(rawToken, false); //Basic토큰
    // const credetials = this.authService.decodeBasicToken(token); //토큰으로 email과 password 생성

    return this.authService.loginWithEmail(user);
  }

  @Post('join/email')
  joinEmail(
    @Body('user') user: Pick<UserModel,'email'|'password'|'nickname' >
  ) {
    return this.authService.joinWithEmail(user);
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
}
