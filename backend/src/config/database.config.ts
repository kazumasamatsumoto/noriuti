import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Match } from '../entities/match.entity';
import { Message } from '../entities/message.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'pachi_user',
  password: process.env.DB_PASSWORD || 'pachi_pass',
  database: process.env.DB_NAME || 'pachi_friend',
  entities: [User, Match, Message],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  extra: {
    charset: 'utf8mb4',
  },
};