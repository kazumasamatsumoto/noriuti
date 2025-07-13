import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Message, Conversation } from '../../models/message.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  // チャット一覧モード or 個別チャットモード
  viewMode: 'list' | 'conversation' = 'list';
  
  // チャット一覧用
  conversations: Conversation[] = [];
  
  // 個別チャット用
  currentUserId: string | null = null;
  currentUser: User | null = null;
  messages: Message[] = [];
  newMessage = '';
  
  // 状態管理
  loading = false;
  sending = false;
  error = '';
  
  // 現在のログインユーザー
  loggedInUser: User | null = null;
  
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // 現在のユーザー情報を取得
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.loggedInUser = user;
    });

    // ルートパラメータを監視
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['userId']) {
        this.viewMode = 'conversation';
        this.currentUserId = params['userId'];
        this.loadConversation();
      } else {
        this.viewMode = 'list';
        this.loadConversations();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // チャット一覧を読み込み
  loadConversations() {
    this.loading = true;
    this.messageService.getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations) => {
          this.conversations = conversations;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading conversations:', error);
          this.error = 'チャット一覧の読み込みに失敗しました';
          this.loading = false;
        }
      });
  }

  // 個別会話を読み込み
  loadConversation() {
    if (!this.currentUserId) return;

    this.loading = true;
    this.error = '';

    // ユーザー情報と会話履歴を並行して取得
    this.userService.getUserById(this.currentUserId)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(user => {
          this.currentUser = user;
          return this.messageService.getConversation(this.currentUserId!);
        })
      )
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          this.loading = false;
          this.shouldScrollToBottom = true;
          
          // 会話を既読にする
          this.markConversationAsRead();
        },
        error: (error) => {
          console.error('Error loading conversation:', error);
          this.error = 'メッセージの読み込みに失敗しました';
          this.loading = false;
        }
      });
  }

  // メッセージ送信
  sendMessage() {
    if (!this.newMessage.trim() || !this.currentUserId || this.sending) {
      return;
    }

    this.sending = true;
    const messageContent = this.newMessage.trim();
    this.newMessage = '';

    this.messageService.sendMessage(this.currentUserId, messageContent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.messages.push(message);
          this.sending = false;
          this.shouldScrollToBottom = true;
          
          // フォーカスを入力欄に戻す
          if (this.messageInput) {
            this.messageInput.nativeElement.focus();
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.error = 'メッセージの送信に失敗しました';
          this.newMessage = messageContent; // メッセージを復元
          this.sending = false;
        }
      });
  }

  // Enterキーでメッセージ送信
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // 会話を既読にする
  markConversationAsRead() {
    if (!this.currentUserId) return;

    this.messageService.markConversationAsRead(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // 未読状態を更新
          this.messages = this.messages.map(msg => ({
            ...msg,
            isRead: true
          }));
        },
        error: (error) => {
          console.error('Error marking conversation as read:', error);
        }
      });
  }

  // チャット一覧から会話を選択
  selectConversation(conversation: Conversation) {
    this.router.navigate(['/chat', conversation.user.id]);
  }

  // チャット一覧に戻る
  backToList() {
    this.router.navigate(['/chat']);
  }

  // メッセージが自分のものかチェック
  isMyMessage(message: Message): boolean {
    return this.loggedInUser?.id === message.senderId;
  }

  // メッセージの送信者名を取得
  getMessageSenderName(message: Message): string {
    if (this.isMyMessage(message)) {
      return 'あなた';
    }
    return this.currentUser?.name || '相手';
  }

  // 時間をフォーマット
  formatMessageTime(timestamp: string): string {
    return this.messageService.formatMessageTime(timestamp);
  }

  formatConversationTime(timestamp: string): string {
    return this.messageService.formatConversationTime(timestamp);
  }

  // 最下部にスクロール
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }

  // エラーをクリア
  clearError() {
    this.error = '';
  }

  // 会話の削除（将来の機能）
  deleteConversation(conversation: Conversation, event: Event) {
    event.stopPropagation();
    // TODO: 実装
    console.log('Delete conversation:', conversation.user.name);
  }

  // ユーザープロフィールを表示（将来の機能）
  viewProfile(userId: string) {
    // TODO: プロフィールモーダルまたはページに遷移
    console.log('View profile:', userId);
  }

  // TrackBy関数（パフォーマンス最適化）
  trackByConversationId(index: number, conversation: Conversation): string {
    return conversation.user.id;
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  // デバッグ用
  get debugInfo() {
    return {
      viewMode: this.viewMode,
      currentUserId: this.currentUserId,
      messagesCount: this.messages.length,
      conversationsCount: this.conversations.length
    };
  }
}