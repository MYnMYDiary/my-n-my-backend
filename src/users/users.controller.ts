import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserModel } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  posrUser(
    @Body('user') user : Pick<UserModel,'email'|'password'|'nickname' >,
  ){
    return this.usersService.createUser(user);
  }
}
