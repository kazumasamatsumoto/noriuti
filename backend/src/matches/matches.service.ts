import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { User } from '../entities/user.entity';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createMatch(userId: string, createMatchDto: CreateMatchDto) {
    if (userId === createMatchDto.targetUserId) {
      throw new BadRequestException('Cannot match with yourself');
    }

    const existingMatch = await this.matchRepository.findOne({
      where: [
        { userId1: userId, userId2: createMatchDto.targetUserId },
        { userId1: createMatchDto.targetUserId, userId2: userId },
      ],
    });

    if (existingMatch) {
      throw new BadRequestException('Match already exists');
    }

    if (createMatchDto.action === 'pass') {
      const match = this.matchRepository.create({
        userId1: userId,
        userId2: createMatchDto.targetUserId,
        status: 'rejected',
      });
      return this.matchRepository.save(match);
    }

    const reverseMatch = await this.matchRepository.findOne({
      where: {
        userId1: createMatchDto.targetUserId,
        userId2: userId,
        status: 'pending',
      },
    });

    if (reverseMatch) {
      reverseMatch.status = 'matched';
      return this.matchRepository.save(reverseMatch);
    }

    const match = this.matchRepository.create({
      userId1: userId,
      userId2: createMatchDto.targetUserId,
      status: 'pending',
    });

    return this.matchRepository.save(match);
  }

  async getMatches(userId: string) {
    const matches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.user1', 'user1')
      .leftJoinAndSelect('match.user2', 'user2')
      .where('(match.userId1 = :userId OR match.userId2 = :userId) AND match.status = :status', {
        userId,
        status: 'matched',
      })
      .select([
        'match.id',
        'match.status',
        'match.createdAt',
        'user1.id',
        'user1.name',
        'user1.profileImage',
        'user2.id',
        'user2.name',
        'user2.profileImage',
      ])
      .getMany();

    return matches.map((match) => ({
      ...match,
      matchedUser: match.userId1 === userId ? match.user2 : match.user1,
    }));
  }

  async getPendingMatches(userId: string) {
    return this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.user1', 'user1')
      .where('match.userId2 = :userId AND match.status = :status', {
        userId,
        status: 'pending',
      })
      .select([
        'match.id',
        'match.status',
        'match.createdAt',
        'user1.id',
        'user1.name',
        'user1.age',
        'user1.profileImage',
        'user1.bio',
      ])
      .getMany();
  }
}