import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'name', 'age', 'gender', 'prefecture', 'city', 'bio', 'favoriteSlots', 'playStyle', 'profileImage'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      select: ['id', 'name', 'age', 'gender', 'prefecture', 'city', 'bio', 'favoriteSlots', 'playStyle', 'profileImage', 'email'],
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    
    Object.assign(user, updateProfileDto);
    
    await this.userRepository.save(user);
    
    return this.findById(id);
  }

  async findPotentialMatches(userId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        id: Not(userId),
        isActive: true,
      },
      select: ['id', 'name', 'age', 'gender', 'prefecture', 'city', 'bio', 'favoriteSlots', 'playStyle', 'profileImage'],
      take: 20,
    });
  }

  async updateProfileImage(id: string, imageUrl: string): Promise<User> {
    const user = await this.findById(id);
    
    user.profileImage = imageUrl;
    
    await this.userRepository.save(user);
    
    return this.findById(id);
  }
}