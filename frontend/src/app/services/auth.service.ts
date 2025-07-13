import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isInitializing = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, registerData)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, loginData)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    // トークンの有効期限をチェック
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        // トークンが期限切れの場合、ローカルストレージをクリア
        this.clearLocalStorage();
        return false;
      }
      
      return true;
    } catch (error) {
      // トークンが無効な場合
      this.clearLocalStorage();
      return false;
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Get full profile after login
    this.getProfile().subscribe(user => {
      this.currentUserSubject.next(user);
    });
  }

  private loadUserFromStorage(): void {
    if (this.isInitializing) return;
    this.isInitializing = true;

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      // トークンの基本チェック（サーバー呼び出しなし）
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          // トークンが期限切れ
          this.clearLocalStorage();
          this.isInitializing = false;
          return;
        }

        // トークンが有効な場合、ユーザー情報を復元
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        
        // バックグラウンドでプロフィールを更新（循環依存を避けるため、エラー時はサイレント処理）
        this.getProfile().subscribe({
          next: (freshUser) => {
            this.currentUserSubject.next(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          },
          error: () => {
            // サーバーエラーの場合はサイレントに処理（循環依存を避けるため）
            // 必要に応じて手動でログアウトしてもらう
          }
        });
      } catch (error) {
        this.clearLocalStorage();
      }
    }
    
    this.isInitializing = false;
  }
}