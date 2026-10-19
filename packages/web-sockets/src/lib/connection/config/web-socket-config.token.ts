import { InjectionToken } from '@angular/core';
import type { ManagerOptions, SocketOptions } from 'socket.io-client';

export interface WebSocketConfig {
  /** The server's socket.io origin, e.g. `https://api.example.com`. */
  url: string;
  options?: Partial<ManagerOptions & SocketOptions>;
}

export const WEBSOCKET_CONFIG = new InjectionToken<WebSocketConfig>('WEBSOCKET_CONFIG');
