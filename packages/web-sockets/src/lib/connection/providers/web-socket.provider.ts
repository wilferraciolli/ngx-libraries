import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { WEBSOCKET_CONFIG, type WebSocketConfig } from '../config/web-socket-config.token';

/** Registers the socket.io connection config for `WebSocketService` to pick up. Add to your
 *  `app.config.ts` providers. */
export function provideWebSocket(config: WebSocketConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: WEBSOCKET_CONFIG, useValue: config }]);
}
