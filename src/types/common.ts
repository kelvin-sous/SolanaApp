export interface BaseError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: BaseError;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface NavigationParams {
  [key: string]: any;
}

export type Theme = 'light' | 'dark';

export interface AppConfig {
  theme: Theme;
  network: 'devnet' | 'testnet' | 'mainnet-beta';
  debug: boolean;
}