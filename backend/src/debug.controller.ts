import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Controller('debug')
export class DebugController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  async debugUsers() {
    return this.usersService.debugUserData();
  }

  @Post('fix-encoding')
  async fixEncoding() {
    return this.usersService.fixUserEncoding();
  }
}