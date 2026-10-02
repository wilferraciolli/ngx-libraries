import type { Provider } from '@angular/core';
import { signal, type Signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  ChatMessageType,
  SocketEventType,
  WebSocketService,
  type ChatMessage,
  type ClientConnection,
  type Room,
  type RoomAcknowledge,
  type WebsocketError,
} from '@wiltech-labs/ngx-web-sockets';

/**
 * Stands in for `WebSocketService` (no real socket.io connection — there's no backend for these
 * stories to reach, the same reason `apps/showcase` never wires `ChatRoom` up at all). Duck-types
 * the same public surface `ChatRoom` calls and scripts a canned reply + a "client connected"
 * status message, so a story can show a message actually arriving without a server.
 *
 * `WebSocketService` is `providedIn: 'root'` and opens a real socket.io connection in its own
 * constructor, so — same reasoning as `notifications-fixture.ts` — this is provided as a
 * story-level override, never as an app-wide provider in `.storybook/preview.ts`. It's a plain
 * class (not `@Injectable`, never constructed by Angular DI) provided via `useValue` rather than
 * `useClass` — `useClass` would need this to be structurally assignable to `WebSocketService`
 * itself, including its private fields, which a duck-typed stand-in deliberately isn't.
 */
export class FakeWebSocketService {
  private readonly connectedSignal = signal(false);
  public readonly connected: Signal<boolean> = this.connectedSignal.asReadonly();

  private readonly events = new Subject<unknown>();
  private clientCounter = 0;

  public connect(): void {
    this.connectedSignal.set(true);
    // A little after connecting, as a real second participant joining would — demonstrates the
    // "client connected" status message without any action from the viewer.
    setTimeout(() => {
      this.events.next({
        clientId: 'bot',
        message: 'A client connected',
      } satisfies ClientConnection);
    }, 1200);
  }

  public disconnect(): void {
    this.connectedSignal.set(false);
  }

  public async joinRoom(room: Room): Promise<RoomAcknowledge> {
    return {
      clientId: `viewer-${++this.clientCounter}`,
      clientName: 'You',
      success: true,
      roomName: room.roomName,
    };
  }

  public async leaveRoom(room: Room): Promise<RoomAcknowledge> {
    return { clientId: 'viewer-1', clientName: 'You', success: true, roomName: room.roomName };
  }

  public send<T>(_event: string, payload: T): void {
    const message = payload as ChatMessage;
    if (message.messageType !== ChatMessageType.COMMENT_ADDED) {
      return; // Typing notifications aren't echoed back — nobody else is really typing.
    }

    // Echoes a canned reply a beat later, as SocketEventType.MESSAGE_REPLY — the same event
    // ChatRoom listens for, so it renders exactly as a real server reply would.
    setTimeout(() => {
      this.events.next({
        id: crypto.randomUUID(),
        clientId: 'bot',
        clientName: 'Grace Hopper',
        roomName: message.roomName,
        messageType: ChatMessageType.COMMENT_ADDED,
        message: pickReply(message.message),
        replyToSender: true,
        timestamp: new Date().toISOString(),
      } satisfies ChatMessage);
    }, 900);
  }

  public on<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      const subscription = this.events.subscribe((value) => {
        if (event === SocketEventType.MESSAGE_REPLY && isChatMessage(value)) {
          subscriber.next(value as T);
        } else if (event === SocketEventType.CLIENT_CONNECTED && isClientConnection(value)) {
          subscriber.next(value as T);
        }
      });
      return () => subscription.unsubscribe();
    });
  }

  public onClientConnected(): Observable<ClientConnection> {
    return this.on<ClientConnection>(SocketEventType.CLIENT_CONNECTED);
  }

  public onClientDisconnected(): Observable<ClientConnection> {
    return new Observable<ClientConnection>(); // Never fires — nobody leaves in these stories.
  }

  public onError(): Observable<WebsocketError> {
    return new Observable<WebsocketError>(); // Never fires in the happy-path stories.
  }

  public onConnectionError(): Observable<WebsocketError> {
    return new Observable<WebsocketError>();
  }
}

function isChatMessage(value: unknown): value is ChatMessage {
  return typeof value === 'object' && value !== null && 'messageType' in value;
}

function isClientConnection(value: unknown): value is ClientConnection {
  return typeof value === 'object' && value !== null && !('messageType' in value);
}

function pickReply(sentText: string): string {
  const replies = [
    'Good question — let me check and get back to you.',
    'Agreed, that sounds right to me.',
    "I'll have a look at that shortly.",
    'Thanks for the update!',
  ];
  return replies[sentText.length % replies.length];
}

/** `{ provide: WebSocketService, useValue: new FakeWebSocketService() }`, for a story's
 *  `moduleMetadata` — a fresh instance per call, so each story gets its own reply timers. */
export function fakeWebSocketProvider(): Provider {
  return { provide: WebSocketService, useValue: new FakeWebSocketService() };
}
