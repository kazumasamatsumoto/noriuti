import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatchService } from '../../services/match.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-matching',
  imports: [CommonModule, RouterLink],
  templateUrl: './matching.html',
  styleUrl: './matching.scss'
})
export class Matching implements OnInit, OnDestroy {
  @ViewChild('cardStack', { static: false }) cardStack!: ElementRef;
  
  potentialMatches: User[] = [];
  currentUserIndex = 0;
  loading = false;
  noMoreUsers = false;
  isDragging = false;
  startX = 0;
  currentX = 0;
  cardRotation = 0;
  showMatchNotification = false;
  matchedUser: User | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(private matchService: MatchService) {}

  ngOnInit() {
    this.loadPotentialMatches();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPotentialMatches() {
    this.loading = true;
    this.matchService.getPotentialMatches()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.potentialMatches = users;
          this.loading = false;
          if (users.length === 0) {
            this.noMoreUsers = true;
          }
        },
        error: (error) => {
          console.error('Error loading potential matches:', error);
          this.loading = false;
          this.noMoreUsers = true;
        }
      });
  }

  getCurrentUser(): User | null {
    return this.potentialMatches[this.currentUserIndex] || null;
  }

  getNextUser(): User | null {
    return this.potentialMatches[this.currentUserIndex + 1] || null;
  }

  onLike() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    this.matchService.createMatch(currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (match) => {
          if (match.status === 'matched') {
            this.showMatchNotification = true;
            this.matchedUser = currentUser;
            setTimeout(() => {
              this.showMatchNotification = false;
              this.nextUser();
            }, 3000);
          } else {
            this.nextUser();
          }
        },
        error: (error) => {
          console.error('Error creating match:', error);
          this.nextUser();
        }
      });
  }

  onPass() {
    this.nextUser();
  }

  private nextUser() {
    this.currentUserIndex++;
    if (this.currentUserIndex >= this.potentialMatches.length) {
      this.noMoreUsers = true;
    }
  }

  // スワイプ機能
  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.startX = event.touches[0].clientX;
    this.currentX = this.startX;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    
    event.preventDefault();
    this.currentX = event.touches[0].clientX;
    const deltaX = this.currentX - this.startX;
    
    // カードの回転と移動
    this.cardRotation = deltaX * 0.1;
    
    const card = event.target as HTMLElement;
    if (card.classList.contains('user-card')) {
      card.style.transform = `translateX(${deltaX}px) rotate(${this.cardRotation}deg)`;
      
      // 色のヒント
      if (deltaX > 50) {
        card.classList.add('like-hint');
        card.classList.remove('pass-hint');
      } else if (deltaX < -50) {
        card.classList.add('pass-hint');
        card.classList.remove('like-hint');
      } else {
        card.classList.remove('like-hint', 'pass-hint');
      }
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const deltaX = this.currentX - this.startX;
    const card = event.target as HTMLElement;
    
    if (card.classList.contains('user-card')) {
      card.classList.remove('like-hint', 'pass-hint');
      
      if (Math.abs(deltaX) > 100) {
        // スワイプ完了
        if (deltaX > 0) {
          this.onLike();
        } else {
          this.onPass();
        }
        
        // カードをアニメーションで画面外に移動
        card.style.transform = `translateX(${deltaX > 0 ? '100vw' : '-100vw'}) rotate(${this.cardRotation}deg)`;
        card.style.opacity = '0';
        
        setTimeout(() => {
          card.style.transform = '';
          card.style.opacity = '';
        }, 300);
      } else {
        // 元の位置に戻す
        card.style.transform = '';
      }
    }
    
    this.cardRotation = 0;
  }

  // マウスイベント（デスクトップ対応）
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX;
    this.currentX = this.startX;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    this.currentX = event.clientX;
    const deltaX = this.currentX - this.startX;
    
    this.cardRotation = deltaX * 0.1;
    
    const card = event.target as HTMLElement;
    if (card.classList.contains('user-card')) {
      card.style.transform = `translateX(${deltaX}px) rotate(${this.cardRotation}deg)`;
      
      if (deltaX > 50) {
        card.classList.add('like-hint');
        card.classList.remove('pass-hint');
      } else if (deltaX < -50) {
        card.classList.add('pass-hint');
        card.classList.remove('like-hint');
      } else {
        card.classList.remove('like-hint', 'pass-hint');
      }
    }
  }

  onMouseUp(event: MouseEvent) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const deltaX = this.currentX - this.startX;
    const card = event.target as HTMLElement;
    
    if (card.classList.contains('user-card')) {
      card.classList.remove('like-hint', 'pass-hint');
      
      if (Math.abs(deltaX) > 100) {
        if (deltaX > 0) {
          this.onLike();
        } else {
          this.onPass();
        }
        
        card.style.transform = `translateX(${deltaX > 0 ? '100vw' : '-100vw'}) rotate(${this.cardRotation}deg)`;
        card.style.opacity = '0';
        
        setTimeout(() => {
          card.style.transform = '';
          card.style.opacity = '';
        }, 300);
      } else {
        card.style.transform = '';
      }
    }
    
    this.cardRotation = 0;
  }

  getAge(user: User): number {
    return user.age;
  }

  getFavoriteSlots(user: User): string {
    return user.favoriteSlots?.join(', ') || 'なし';
  }

  closeMatchNotification() {
    this.showMatchNotification = false;
    this.nextUser();
  }

  reloadMatches() {
    this.currentUserIndex = 0;
    this.noMoreUsers = false;
    this.loadPotentialMatches();
  }
}
