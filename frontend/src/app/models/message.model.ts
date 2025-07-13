export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  sender?: {
    id: string;
    name: string;
  };
  receiver?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface CreateMessageRequest {
  receiverId: string;
  content: string;
}

export interface Conversation {
  userId: string;
  user: {
    id: string;
    name: string;
    profileImage?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}