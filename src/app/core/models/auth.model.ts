export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  autenticado: boolean;
  username: string;
  mensaje: string;
}

export interface AuthErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
}

export interface AuthSession {
  username: string;
  autenticado: boolean;
  timestamp: number;
}
