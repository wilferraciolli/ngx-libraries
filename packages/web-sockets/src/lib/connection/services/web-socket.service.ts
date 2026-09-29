import { Injectable, inject, signal, type Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { io, type Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { WEBSOCKET_CONFIG } from '../config/web-socket-config.token';
import { SocketMessageType } from '../constants/socket-message-type.constant';
import { SocketEventType } from '../constants/socket-event.constant';
import type { Room } from '../interfaces/room.interface';
import type { RoomAcknowledge } from '../interfaces/room-acknowledge.interface';
import type { ClientConnection } from '../interfaces/client-connection.interface';
import type { WebsocketError } from '../interfaces/websocket-error.interface';

/** Thin, signal-based wrapper around a single socket.io connection: connect/disconnect, join/leave
 *  a server-managed room, and listen for named events. One socket per app (`providedIn: 'root'`) —
 *  join/leave whichever rooms you need on top of it. */
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private readonly config = inject(WEBSOCKET_CONFIG);
  private readonly socket: Socket = io(this.config.url, {
    autoConnect: false,
    ...this.config.options
  });

  private readonly _connected = signal(false);
  /** Reflects the socket's actual `connect`/`disconnect` events — not just that `connect()` was called. */
  public readonly connected: Signal<boolean> = this._connected.asReadonly();
  /** RxJS-interop companion to `connected`, for combining with the `Observable`-returning methods
   *  below (e.g. `combineLatest([this.connected$, this.onError()])`) instead of mixing signal reads
   *  into RxJS pipelines by hand. */
  public readonly connected$: Observable<boolean> = toObservable(this.connected);

  constructor() {
    this.socket.on('connect', () => this._connected.set(true));
    this.socket.on('disconnect', () => this._connected.set(false));
  }

  public connect(): void {
    this.socket.connect();
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  public async joinRoom(room: Room): Promise<RoomAcknowledge> {
    return this.socket.emitWithAck(SocketMessageType.JOIN_ROOM, room);
  }

  public async leaveRoom(room: Room): Promise<RoomAcknowledge> {
    return this.socket.emitWithAck(SocketMessageType.LEAVE_ROOM, room);
  }

  /** Emits an event to the server. Use `joinRoom`/`leaveRoom` for room membership. */
  public send<T>(event: string, payload: T): void {
    this.socket.emit(event, payload);
  }

  /** Listens for a named server event. Unsubscribing removes the underlying socket.io listener. */
  public on<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      const handler = (data: T): void => subscriber.next(data);
      this.socket.on(event, handler);
      return () => this.socket.off(event, handler);
    });
  }

  public onClientConnected(): Observable<ClientConnection> {
    return this.on<ClientConnection>(SocketEventType.CLIENT_CONNECTED);
  }

  public onClientDisconnected(): Observable<ClientConnection> {
    return this.on<ClientConnection>(SocketEventType.CLIENT_DISCONNECTED);
  }

  public onError(): Observable<WebsocketError> {
    return this.on<WebsocketError>(SocketEventType.ERROR);
  }

  public onConnectionError(): Observable<WebsocketError> {
    return this.on<WebsocketError>(SocketEventType.ERROR_CONNECTION);
  }
}
