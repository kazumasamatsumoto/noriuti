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
    const users = await this.userRepository.find({
      where: {
        id: Not(userId),
        isActive: true,
      },
      select: ['id', 'name', 'age', 'gender', 'prefecture', 'city', 'bio', 'favoriteSlots', 'playStyle', 'profileImage'],
      take: 20,
    });
    
    // デバッグ: 文字化けチェック
    users.forEach(user => {
      console.log('User name from DB:', user.name, 'Buffer:', Buffer.from(user.name || '', 'utf8'));
    });
    
    return users;
  }

  async updateProfileImage(id: string, imageUrl: string): Promise<User> {
    const user = await this.findById(id);
    
    user.profileImage = imageUrl;
    
    await this.userRepository.save(user);
    
    return this.findById(id);
  }

  async debugUserData() {
    const users = await this.userRepository.find({
      select: ['id', 'name', 'email'],
      take: 10
    });
    
    return users.map(user => ({
      id: user.id,
      name: user.name,
      nameBuffer: Buffer.from(user.name || '', 'utf8').toString('hex'),
      hasCorruption: (user.name || '').includes('�'),
      email: user.email
    }));
  }

  async fixUserEncoding() {
    const users = await this.userRepository.find();
    const fixedUsers: Array<{id: string, originalName: string, fixedName: string, originalBio?: string, fixedBio?: string}> = [];
    
    for (const user of users) {
      let needsSave = false;
      const result: any = { id: user.id };
      
      // 名前の文字化け修正
      if (user.name && user.name.includes('�')) {
        result.originalName = user.name;
        user.name = `ユーザー${user.id.slice(-4)}`;
        result.fixedName = user.name;
        needsSave = true;
      }
      
      // bioの文字化け修正
      if (user.bio && user.bio.includes('�')) {
        result.originalBio = user.bio;
        user.bio = 'パチスロ大好きです'; // デフォルトのbio
        result.fixedBio = user.bio;
        needsSave = true;
      }
      
      if (needsSave) {
        await this.userRepository.save(user);
        fixedUsers.push(result);
      }
    }
    
    return {
      message: `Fixed ${fixedUsers.length} users`,
      fixedUsers
    };
  }
}