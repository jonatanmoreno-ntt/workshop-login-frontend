import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginCredentials, LoginRequest, LoginResponse, UserSession } from '../models/auth.models';
import { SessionService } from './session.service';

interface ApiErrorPayload {
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private sessionService: SessionService) {}

  async login(credentials: LoginCredentials): Promise<UserSession> {
    const payload: LoginRequest = {
      username: credentials.username,
      password: credentials.password,
      client: environment.authClient
    };

    const response = await fetch(`${environment.authBaseUrl}${environment.authLoginPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await this.readJson<Partial<LoginResponse> & ApiErrorPayload>(response);

    if (!response.ok) {
      const detail = this.getErrorMessage(data);
      throw new Error(detail);
    }

    if (!data?.token || !data.user) {
      throw new Error('El backend respondió sin token.');
    }

    this.sessionService.setSession(data.token, data.user);
    return data.user;
  }

  private async readJson<T>(response: Response): Promise<T | null> {
    try {
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  private getErrorMessage(data: ApiErrorPayload | null): string {
    if (data?.message && data.message.trim()) {
      return data.message;
    }

    return 'No se pudo autenticar. Verifica tus credenciales.';
  }
}
