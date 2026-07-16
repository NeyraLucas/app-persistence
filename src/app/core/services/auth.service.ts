import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthSession, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL = 'http://localhost:8081/api/auth/login';
  private readonly STORAGE_KEY = 'auth_session';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.API_URL, { username, password }).pipe(
      tap((res) => {
        if (res.autenticado) {
          const session: AuthSession = {
            username,
            autenticado: true,
            timestamp: Date.now(),
          };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        }
      }),
    );
  }

  isLoggedIn(): boolean {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return false;
      const session: AuthSession = JSON.parse(raw);
      return session?.autenticado === true;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  getUsername(): string | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      return session?.autenticado === true ? session.username : null;
    } catch {
      return null;
    }
  }
}
