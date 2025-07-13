import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  favoriteSlots?: string[];

  @IsOptional()
  playStyle?: {
    budget: string;
    frequency: string;
    timeSlot: string[];
  };

  @IsOptional()
  @IsString()
  profileImage?: string;
}