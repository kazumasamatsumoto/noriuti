import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Message, Conversation } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly API_URL = 'http://localhost:3000';
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();
  
  private currentConversationSubject = new BehaviorSubject<Message[]>([]);
  public currentConversation$ = this.currentConversationSubject.asObservable();

  constructor(private http: HttpClient) {}

  // メッセージを送信
  sendMessage(receiverId: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.API_URL}/messages`, {
      receiverId,
      content
    });
  }

  // 特定のユーザーとの会話履歴を取得
  getConversation(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API_URL}/messages/conversation/${userId}`);
  }

  // 全ての会話一覧を取得
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.API_URL}/messages/conversations`);
  }

  // 未読メッセージ数を取得
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.API_URL}/messages/unread-count`);
  }

  // メッセージを既読にする
  markAsRead(messageId: string): Observable<Message> {
    return this.http.patch<Message>(`${this.API_URL}/messages/${messageId}/read`, {});
  }

  // 会話の全メッセージを既読にする
  markConversationAsRead(userId: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/messages/conversation/${userId}/read`, {});
  }

  // ローカル状態を更新
  updateConversations(conversations: Conversation[]): void {
    this.conversationsSubject.next(conversations);
  }

  updateCurrentConversation(messages: Message[]): void {
    this.currentConversationSubject.next(messages);
  }

  // 新しいメッセージを現在の会話に追加
  addMessageToCurrentConversation(message: Message): void {
    const currentMessages = this.currentConversationSubject.value;
    this.currentConversationSubject.next([...currentMessages, message]);
  }

  // 会話一覧に新しいメッセージを反映
  updateConversationWithNewMessage(message: Message): void {
    const conversations = this.conversationsSubject.value;
    const existingConversationIndex = conversations.findIndex(
      conv => conv.user.id === message.senderId || conv.user.id === message.receiverId
    );

    if (existingConversationIndex >= 0) {
      // 既存の会話を更新
      const updatedConversations = [...conversations];
      updatedConversations[existingConversationIndex] = {
        ...updatedConversations[existingConversationIndex],
        lastMessage: message,
        unreadCount: updatedConversations[existingConversationIndex].unreadCount + 1
      };
      
      // 最新メッセージの会話を一番上に移動
      const updatedConversation = updatedConversations.splice(existingConversationIndex, 1)[0];
      updatedConversations.unshift(updatedConversation);
      
      this.conversationsSubject.next(updatedConversations);
    } else {
      // 新しい会話を作成（この場合は通常API から再取得）
      this.getConversations().subscribe(newConversations => {
        this.updateConversations(newConversations);
      });
    }
  }

  // WebSocket接続用のメソッド（将来の実装用）
  connectToChat(userId: string): void {
    // TODO: WebSocket実装時に追加
    console.log(`Connecting to chat for user: ${userId}`);
  }

  disconnectFromChat(): void {
    // TODO: WebSocket実装時に追加
    console.log('Disconnecting from chat');
  }

  // ユーティリティメソッド
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'たった今';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`;
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else if (diffInDays < 7) {
      return `${diffInDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  formatConversationTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (isYesterday) {
      return '昨日';
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      });
    }
  }
}