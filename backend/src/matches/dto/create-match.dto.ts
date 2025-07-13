import { IsString, IsEnum } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  targetUserId: string;

  @IsEnum(['like', 'pass'])
  action: 'like' | 'pass';
}