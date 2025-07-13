import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async createMatch(@Request() req, @Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.createMatch(req.user.id, createMatchDto);
  }

  @Get()
  async getMatches(@Request() req) {
    return this.matchesService.getMatches(req.user.id);
  }

  @Get('pending')
  async getPendingMatches(@Request() req) {
    return this.matchesService.getPendingMatches(req.user.id);
  }
}