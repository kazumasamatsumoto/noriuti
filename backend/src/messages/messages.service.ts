import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createMessage(senderId: string, createMessageDto: CreateMessageDto) {
    if (senderId === createMessageDto.receiverId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    const receiver = await this.userRepository.findOne({
      where: { id: createMessageDto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const message = this.messageRepository.create({
      senderId,
      receiverId: createMessageDto.receiverId,
      content: createMessageDto.content,
    });

    return this.messageRepository.save(message);
  }

  async getConversation(userId: string, otherUserId: string) {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.senderId = :userId AND message.receiverId = :otherUserId) OR (message.senderId = :otherUserId AND message.receiverId = :userId)',
        { userId, otherUserId },
      )
      .orderBy('message.createdAt', 'ASC')
      .select([
        'message.id',
        'message.content',
        'message.isRead',
        'message.createdAt',
        'sender.id',
        'sender.name',
        'receiver.id',
        'receiver.name',
      ])
      .getMany();

    await this.messageRepository.update(
      {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      { isRead: true },
    );

    return messages;
  }

  async getConversations(userId: string) {
    const conversations = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .select([
        'message.id',
        'message.content',
        'message.isRead',
        'message.createdAt',
        'message.senderId',
        'message.receiverId',
        'sender.id',
        'sender.name',
        'sender.profileImage',
        'receiver.id',
        'receiver.name',
        'receiver.profileImage',
      ])
      .getMany();

    const conversationMap = new Map();

    conversations.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      if (message.receiverId === userId && !message.isRead) {
        conversationMap.get(otherUserId).unreadCount++;
      }
    });

    return Array.from(conversationMap.values());
  }
}