import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.createMessage(req.user.id, createMessageDto);
  }

  @Get('conversations')
  async getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('conversation/:userId')
  async getConversation(@Request() req, @Param('userId') userId: string) {
    return this.messagesService.getConversation(req.user.id, userId);
  }
}