export interface WebsocketError {
  status: number; // HTTP-like status code (e.g. 400, 401, 500)
  message: string;
  error?: string;
  timestamp?: string;
  path?: string;
  code?: string;
  details?: unknown;
}
