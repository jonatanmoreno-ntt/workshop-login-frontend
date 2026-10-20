export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserSession {
  username: string;
  displayName?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  client: string;
}

export interface LoginResponse {
  token: string;
  user: UserSession;
}

export interface UserPreferences {
  theme: string;
  showTips: boolean;
  compact: boolean;
}

export interface UiMessage {
  level: 'error' | 'info';
  text: string;
}
