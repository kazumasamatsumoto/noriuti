import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  twitterId: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  age: number;

  @Column()
  gender: string;

  @Column()
  prefecture: string;

  @Column()
  city: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'json', nullable: true })
  favoriteSlots: string[];

  @Column({ type: 'json', nullable: true })
  playStyle: {
    budget: string;
    frequency: string;
    timeSlot: string[];
  };

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}