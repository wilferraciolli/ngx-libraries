# @wiltech-labs/ngx-web-sockets

Shared Angular websocket client — connect, join/leave a server-managed room, and a chat UI built
on top of that. See root `../../CLAUDE.md` for repo-wide conventions.

Ported and modernized from a sibling `ng-libraries/wt-libraries/projects/wt-websockets` prototype —
that project's shape (config token, provider, service, room join/leave, a chat list + chat message
component) carried over, but the implementation didn't; see **Modernized from the source** below.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── connection/               # Generic socket.io connection + room primitives — reusable for
    │   │                         # any websocket feature, not just chat
    │   ├── config/                 # WebSocketConfig + WEBSOCKET_CONFIG token
    │   ├── providers/              # provideWebSocket()
    │   ├── services/               # WebSocketService — connect/disconnect, join/leaveRoom, on<T>()
    │   ├── constants/              # SocketEventType (server->client), SocketMessageType (client->server)
    │   └── interfaces/             # Room, RoomAcknowledge, ClientConnection, WebsocketError
    └── chat/                     # Chat feature built on the connection layer
        ├── components/
        │   ├── chat-room/          # ChatRoom — joins/leaves one room, message list + composer
        │   └── chat-message-bubble/ # ChatMessageBubble — renders one ChatMessage
        ├── config/                 # NGX_CHAT_TEXT — ChatRoom's own overridable UI text
        ├── constants/              # ChatMessageType (comment-added / user-typing)
        └── interfaces/             # ChatMessage
```

## Conventions

- Real Angular constructs (`@Injectable`/`@Component`) — not framework-agnostic functions. Every
  known consumer is Angular, so idiomatic DI beats a generic-TS compromise.
- One folder per concern under `src/lib/` — `connection/` (protocol-level, reusable beyond chat)
  and `chat/` (the feature built on it) are deliberately separate, same split as `media`'s
  `loading/`/`youtube/`. A second feature built on the connection layer (e.g. presence, live
  cursors) gets its own sibling folder next to `chat/`, not bolted onto it.
- Standalone components only, no NgModules.
- No Angular Material dependency — `ChatRoom`/`ChatMessageBubble` follow the conventions' chat
  recipe from M3 tokens (`--ngx-chat-*` override them), same approach as `media`/`ai-tools`.
- Timestamps come from `Temporal.Now.instant()` (the conventions' dates rule), so
  `temporal-polyfill` is a regular dependency, same as `forms`.
- `WebSocketService` is `providedIn: 'root'` — one socket per app. Join/leave whichever rooms you
  need on top of it; don't create a second `WebSocketService`-like thing per room.
- `ChatRoom` manages exactly **one** room for its lifetime (joins `roomName` in `ngOnInit`, leaves
  it in `ngOnDestroy`). To switch rooms, render a fresh instance (e.g. behind `@if`) rather than
  mutating `roomName` on a live one — keeps the component's lifecycle hooks the single source of
  truth for join/leave, instead of also needing an `effect()` to track "the previous room name."
- The `Room`/`RoomAcknowledge`/`ChatMessage` interfaces model a specific server contract (originally
  a NestJS Socket.IO gateway) — same spirit as `api-client` mirroring `insurly-api`'s error shape.
  If a consumer's server uses different event names, adjust `SocketEventType`/`SocketMessageType`
  directly rather than trying to make them configurable per-call.
- **Signal/RxJS interop, both directions.** `WebSocketService.connected` is the source of truth
  (a `Signal<boolean>`); `connected$` is a `toObservable()` companion for consumers who want to
  combine it with the `Observable`-returning methods (`onError()`, etc.) in an RxJS pipeline —
  don't add a second independent `BehaviorSubject` for the same state. Going the other way,
  `ChatRoom` subscribes to `WebSocketService`'s event `Observable`s with `takeUntilDestroyed()`
  (from `@angular/core/rxjs-interop`, given an explicit `DestroyRef` since the subscriptions are
  set up in `ngOnInit`, not a constructor/field initializer) instead of hand-rolling a `Subscription`
  container — call `takeUntilDestroyed(this.destroyRef)` fresh in each `.pipe()`, not hoisted into a
  shared `const`, or TypeScript infers it against only the first call site and every other
  `.pipe()` sees `unknown`.
- **`ChatRoom`'s own UI text (connection status, composer placeholder, transient status messages)
  comes from `NGX_CHAT_TEXT`** (`InjectionToken<() => ChatText>`, added 2026-09-30), not hardcoded
  strings — message _bodies_ stay app/server data, untouched by this. Same resolver-token pattern
  as `ngx-dates`' `NGX_DATES_LOCALE`/`ngx-forms`' `NGX_FORMS_LOCALE`/`ngx-graphs`'
  `NGX_GRAPHS_TEXT`: a plain function, so this package has no build-time dependency on `ngx-translations`
  (see root `CLAUDE.md`'s "Inter-package deps"). The two parameterized messages (`clientTyping`,
  `error`/`connectionError`) are functions rather than interpolation-placeholder strings, to avoid
  building a template-parsing mini-engine for two call sites.

## Modernized from the source

The original prototype worked, but had accumulated rough edges this rewrite deliberately fixes
rather than carries forward:

- **Dropped the `ngx-socket-io` dependency.** It's a thin wrapper around `socket.io-client` that
  forced awkward escapes like `socket.ioSocket.connected`/`socket.ioSocket.on(...)` to reach the
  real client. This package calls `io()` from `socket.io-client` directly — one fewer dependency,
  no wrapper indirection. `provideWebSocket()`/`WEBSOCKET_CONFIG` now configure our own
  `WebSocketConfig` (`{ url, options }`) instead of `ngx-socket-io`'s `SocketIoConfig`.
- **Dropped `@types/socket.io-client`.** `socket.io-client` has shipped its own types since v3 —
  the separate `@types` package is stale and unnecessary.
- **Connection state is a signal, driven by the actual `connect`/`disconnect` socket events.** The
  original set its `BehaviorSubject` to `true` immediately after calling `.connect()`, before the
  handshake had actually succeeded — a real bug (a failed connection attempt would still report
  "connected"). `WebSocketService.connected` only flips once the socket itself fires `connect`/
  `disconnect`. This also removes the redundant pair of `isConnected()` (sync) and `getConnected()`
  (`Observable<boolean>`) APIs — a `Signal<boolean>` serves both call sites.
- **One generic `on<T>(event)` instead of five near-identical hand-rolled `Observable` wrappers
  and two `Subject`s.** The original built a fresh `new Observable(...)` around `socket.on`/
  `socket.off` separately for messages, client-connected, client-disconnected, and (via two
  `Subject`s populated in a constructor-time `_setUpErrorListeners()`) errors and connection errors.
  Since socket.io supports multiple listeners per event natively, none of that multiplexing
  infrastructure was needed — `onClientConnected()`/`onClientDisconnected()`/`onError()`/
  `onConnectionError()` are now one-line calls to a single shared `on<T>()`.
- **Removed dead code**: the commented-out original `SocketIoConfig` example, the unused
  `SocketConfig` interface (with a `// TODO what is this interface for??????` comment — it wasn't
  referenced anywhere), and the duplicate `joinRoom1`/`leaveRoom1` methods (an old callback-based
  implementation left alongside the `emitWithAck`-based `joinRoom`/`leaveRoom` actually in use).
- **No more hardcoded demo data in the library itself.** The original's chat component had a fixed
  "Chat 1 / Chat 2 / Chat 3" room switcher and a hardcoded `clientName: 'Client Name'` baked into
  the library component. `ChatRoom` instead takes `roomName`/`clientName` as inputs — which rooms
  exist and who the user is are the consuming app's decisions, not this library's.
- **Signals over `@Input()`/RxJS `Subject`s for component state** (`ChatMessageBubble.isSelf`,
  `ChatRoom.messages`/`draft`/`statusMessage`), and a manual `(input)` event + signal instead of
  `FormsModule`/`[(ngModel)]` for the message composer — same pattern as `ai-tools`' `AiTextBox`,
  and avoids pulling in `@angular/forms` for one text input.
- Real `id`s (`crypto.randomUUID()`) and timestamps (`new Date().toISOString()`) instead of the
  original's hardcoded placeholder `'id'` and `'2025-01-01T09:00:00Z'`.

## Status

- New package: `WebSocketService`/`provideWebSocket()` plus `ChatRoom`/`ChatMessageBubble`.
- Not yet published to npm — under development.
- No consumers yet. No server exists to exercise this against yet either — this is client-side
  plumbing to drop into a project once its NestJS (or other Socket.IO) backend is ready; the
  `apps/showcase` demo app intentionally does **not** wire this one in, since there's nothing for
  it to actually connect to.
