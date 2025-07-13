import { IsEmail, IsString, IsInt, IsArray, IsOptional, MinLength, Min, Max } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(18)
  @Max(100)
  age: number;

  @IsString()
  gender: string;

  @IsString()
  prefecture: string;

  @IsString()
  city: string;

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
}