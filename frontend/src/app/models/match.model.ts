export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  status: 'pending' | 'matched' | 'rejected';
  user1?: User;
  user2?: User;
  matchedUser?: User;
  createdAt: string;
}

export interface CreateMatchRequest {
  targetUserId: string;
  action: 'like' | 'pass';
}

import { User } from './user.model';