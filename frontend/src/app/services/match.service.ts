import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { Match } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private readonly API_URL = 'http://localhost:3000';
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  public matches$ = this.matchesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // 潜在的なマッチ相手を取得
  getPotentialMatches(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users/potential-matches`);
  }

  // マッチを作成（Like操作）
  createMatch(targetUserId: string): Observable<Match> {
    return this.http.post<Match>(`${this.API_URL}/matches`, {
      targetUserId
    });
  }

  // 自分のマッチ一覧を取得
  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.API_URL}/matches`);
  }

  // 保留中のマッチを取得
  getPendingMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.API_URL}/matches/pending`);
  }

  // マッチ状態を更新（承認/拒否）
  updateMatchStatus(matchId: string, status: 'matched' | 'rejected'): Observable<Match> {
    return this.http.patch<Match>(`${this.API_URL}/matches/${matchId}`, {
      status
    });
  }

  // マッチ状態を更新
  updateMatches(matches: Match[]): void {
    this.matchesSubject.next(matches);
  }

  // 新しいマッチの通知
  addNewMatch(match: Match): void {
    const currentMatches = this.matchesSubject.value;
    this.matchesSubject.next([...currentMatches, match]);
  }
}