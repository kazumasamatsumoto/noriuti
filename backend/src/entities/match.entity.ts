import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId1: string;

  @Column({ type: 'uuid' })
  userId2: string;

  @Column({ type: 'enum', enum: ['pending', 'matched', 'rejected'] })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId1' })
  user1: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId2' })
  user2: User;

  @CreateDateColumn()
  createdAt: Date;
}