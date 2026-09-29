# @wiltech-labs/ngx-web-sockets

Shared Angular websocket client — connect, join/leave a server-managed room, and a chat UI built on
top of it. Built directly on `socket.io-client`, no Material dependency.

## Installation

```bash
npm install @wiltech-labs/ngx-web-sockets
```

Peer dependencies: `@angular/core`, `@angular/common`, `rxjs` (all matching your Angular version).
`socket.io-client` is installed automatically as a regular dependency of this package.

Provide your server's socket.io origin in `app.config.ts`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideWebSocket } from '@wiltech-labs/ngx-web-sockets';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideWebSocket({
      url: 'https://api.example.com',
      options: {
        // any socket.io-client ManagerOptions/SocketOptions, e.g.:
        // withCredentials: true,
        // auth: { token: '...' }
      }
    })
  ]
};
```

The socket does **not** auto-connect — nothing happens until something calls `connect()` (or you
render a `ChatRoom`, which calls it for you the first time it's needed).

## Server contract

This package assumes a server (originally a NestJS Socket.IO gateway) that:

- accepts `join-room` / `leave-room` emits with an **ack** callback, responding with
  `{ clientId, clientName, success, roomName }`
- broadcasts chat messages back out under a `message-reply` event, shaped like `ChatMessage`
- emits `client-connected` / `client-disconnected` with `{ clientId, message }`
- emits `error` for application errors, `{ status, message, ... }`

If your server uses different event names, the `SocketEventType`/`SocketMessageType` enums are the
one place that encodes them — adjust a fork of this package rather than trying to override them
per call.

## `WebSocketService`

The low-level building block — one shared socket per app (`providedIn: 'root'`), with room
join/leave and a generic event listener on top of it. Use this directly if you're not building a
chat feature, or building your own UI on top of the same connection:

```ts
import { Component, inject, OnInit } from '@angular/core';
import { WebSocketService } from '@wiltech-labs/ngx-web-sockets';

interface PresenceUpdate {
  userId: string;
  online: boolean;
}

@Component({ /* ... */ })
export class PresenceComponent implements OnInit {
  private readonly webSocket = inject(WebSocketService);
  protected readonly connected = this.webSocket.connected; // Signal<boolean>

  async ngOnInit() {
    this.webSocket.connect();
    await this.webSocket.joinRoom({ roomName: 'presence' });

    this.webSocket.on<PresenceUpdate>('presence-update').subscribe((update) => {
      // ...
    });
  }
}
```

## `ChatRoom`

A ready-to-drop-in chat UI: joins `roomName` on init, leaves it on destroy, shows the message
history, a typing indicator, and a composer.

```ts
import { Component } from '@angular/core';
import { ChatRoom } from '@wiltech-labs/ngx-web-sockets';

@Component({
  selector: 'app-support-chat',
  imports: [ChatRoom],
  template: `<app-chat-room roomName="support" [clientName]="currentUserName" />`
})
export class SupportChatComponent {
  currentUserName = 'Jordan';
}
```

`ChatRoom` manages exactly one room for its lifetime. To let a user switch rooms, render a fresh
instance rather than changing `roomName` on a live one:

```html
@if (activeRoom(); as room) {
  <app-chat-room [roomName]="room" [clientName]="clientName" />
}
```

Changing `activeRoom()` destroys the old `ChatRoom` (leaving its room) and creates a new one
(joining the new room).

### Theming

```css
:root {
  --ngx-chat-border: rgba(0, 0, 0, 0.12);
  --ngx-chat-bubble-background: #f0f0f0;
  --ngx-chat-bubble-color: #1a1a1a;
  --ngx-chat-bubble-self-background: #4f7cff; /* also the Send button's background */
  --ngx-chat-bubble-self-color: #ffffff;
  --ngx-chat-online-color: #16a34a;
  --ngx-chat-offline-color: #b91c1c;
  --ngx-chat-status-color: #6b7280;
}
```

## Other exports

- `ChatMessageBubble` — renders a single `ChatMessage`, used internally by `ChatRoom`; exported in
  case you want to build your own message list layout instead.
- `Room`, `RoomAcknowledge`, `ClientConnection`, `WebsocketError`, `ChatMessage` — the interfaces
  above are built from.
- `SocketEventType`, `SocketMessageType`, `ChatMessageType` — the wire event/message-type constants.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── connection/       # WebSocketService, provideWebSocket(), room/connection interfaces
    └── chat/             # ChatRoom, ChatMessageBubble, ChatMessage
```

## Status

Not yet published to npm — under development. No server exists yet to exercise this against; it's
client-side plumbing ready for whenever a project needs it.

## Publishing

To publish this package to npm:

```bash
cd packages/web-sockets
npm run build
cd dist
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
