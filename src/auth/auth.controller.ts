import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModel } from 'src/users/entities/user.entity';
import { MailService } from './mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService
  ) {}

  @Post('login/email')
  loginEmail(
    @Body('user') user: Pick<UserModel,'email'|'password' >,
  ){
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
