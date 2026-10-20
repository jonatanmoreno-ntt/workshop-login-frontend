import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginCredentials, UiMessage, UserPreferences } from '../models/auth.models';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  busy = false;
  message: UiMessage | null = null;
  preferences: UserPreferences;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sessionService: SessionService
  ) {
    this.preferences = this.sessionService.getPreferences();
  }

  async login(): Promise<void> {
    this.message = null;

    const username = this.username.trim();
    if (!username) {
      this.message = { level: 'error', text: 'Ingrese un usuario.' };
      return;
    }

    const password = this.password.trim();
    if (!password) {
      this.message = { level: 'error', text: 'Ingrese una contraseña.' };
      return;
    }

    const credentials: LoginCredentials = { username, password };

    this.busy = true;
    try {
      await this.authService.login(credentials);
      this.sessionService.savePreferences(this.preferences);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.message = {
        level: 'error',
        text: `No se pudo autenticar a ${username}. ${this.resolveErrorMessage(error)}`
      };
    } finally {
      this.busy = false;
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Error desconocido.';
  }
}
