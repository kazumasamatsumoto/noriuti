import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('debug-users')
  async debugUsers() {
    return this.usersService.debugUserData();
  }

  @Post('fix-encoding')
  async fixEncoding() {
    return this.usersService.fixUserEncoding();
  }
}