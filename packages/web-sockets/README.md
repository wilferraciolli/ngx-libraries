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
      },
    }),
  ],
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

@Component({/* ... */})
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

`connected` is a `Signal<boolean>` — read it directly in a template or `computed()`. If you need it
in an RxJS pipeline instead (e.g. combined with `onError()`), use the `connected$` companion:

```ts
import { combineLatest } from 'rxjs';

combineLatest([this.webSocket.connected$, this.webSocket.onError()]).subscribe(
  ([connected, error]) => {
    // ...
  },
);
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
  template: `<ngx-chat-room roomName="support" [clientName]="currentUserName" />`,
})
export class SupportChatComponent {
  currentUserName = 'Jordan';
}
```

`ChatRoom` manages exactly one room for its lifetime. To let a user switch rooms, render a fresh
instance rather than changing `roomName` on a live one:

```html
@if (activeRoom(); as room) {
<ngx-chat-room [roomName]="room" [clientName]="clientName" />
}
```

Changing `activeRoom()` destroys the old `ChatRoom` (leaving its room) and creates a new one
(joining the new room).

### Theming

`ChatRoom` implements the M3 chat recipe from the app's tokens, so it's right in light and dark with
no setup: the other party's bubbles in `surface-container-high` (left), the viewer's in
`primary-container` (right), large corners with an extra-small corner on the speaker's side; an
outlined message field and a filled **Send message** icon button; the room on a
`surface-container-low` panel. The message list is a `role="log"` live region and the connection
line a `role="status"`.

`ChatRoom` fills the height it's given (400px by default) — the list scrolls and the composer stays
pinned. Size it from a shell with `--ngx-chat-height: 100%`.

For a genuine one-off, override with tokens (never hex values): `--ngx-chat-surface`,
`--ngx-chat-bubble-background`, `--ngx-chat-bubble-color`, `--ngx-chat-bubble-self-background`,
`--ngx-chat-bubble-self-color`, `--ngx-chat-height`.

### Translating `ChatRoom`'s text

Connection status, the composer placeholder, and transient status messages ("A client connected",
"X is typing…") come from `NGX_CHAT_TEXT` (defaults to English), not hardcoded strings — message
_bodies_ are still app/server data, untouched by this. Override it once in `app.config.ts`, e.g.
wired to [`@wiltech-labs/ngx-translations`](../translations):

```ts
import { inject } from '@angular/core';
import { DEFAULT_CHAT_TEXT, NGX_CHAT_TEXT } from '@wiltech-labs/ngx-web-sockets';
import { TranslationsService } from '@wiltech-labs/ngx-translations';

{
  provide: NGX_CHAT_TEXT,
  useFactory: () => {
    const translations = inject(TranslationsService);
    return () => ({
      ...DEFAULT_CHAT_TEXT,
      connected: translations.t('chat.connected'),
      connecting: translations.t('chat.connecting'),
      composerPlaceholder: translations.t('chat.composerPlaceholder'),
      clientTyping: (clientName: string) => translations.t('chat.clientTyping', { clientName })
      // ...override only the keys the app actually wants translated; the rest fall back to English.
    });
  }
}
```

No dependency on `ngx-translations` from this package — the resolver is a plain function, same as
`ngx-dates`' `NGX_DATES_LOCALE`.

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
