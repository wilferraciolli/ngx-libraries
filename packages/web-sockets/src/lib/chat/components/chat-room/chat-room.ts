import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Temporal } from 'temporal-polyfill';
import { WebSocketService } from '../../../connection/services/web-socket.service';
import { SocketEventType } from '../../../connection/constants/socket-event.constant';
import { SocketMessageType } from '../../../connection/constants/socket-message-type.constant';
import { NGX_CHAT_TEXT } from '../../config/chat-text.token';
import { ChatMessageType } from '../../constants/chat-message-type.constant';
import type { ChatMessage } from '../../interfaces/chat-message.interface';
import { ChatMessageBubble } from '../chat-message-bubble/chat-message-bubble';

const STATUS_MESSAGE_DURATION_MS = 2000;

/**
 * Joins `roomName` on init and leaves it on destroy — connects the shared `WebSocketService` first
 * if it isn't already connected. Manages exactly one room for its lifetime; to switch rooms, render
 * a fresh instance (e.g. behind an `@if`) rather than changing `roomName` on a live one.
 */
@Component({
  selector: 'ngx-chat-room',
  standalone: true,
  imports: [ChatMessageBubble],
  templateUrl: './chat-room.html',
  styleUrl: './chat-room.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatRoom implements OnInit, OnDestroy {
  private readonly webSocket = inject(WebSocketService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resolveText = inject(NGX_CHAT_TEXT);

  public readonly roomName = input.required<string>();
  public readonly clientName = input.required<string>();

  protected readonly connected = this.webSocket.connected;
  protected readonly text = computed(() => this.resolveText());
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly draft = signal('');
  protected readonly statusMessage = signal<string | null>(null);
  protected readonly clientId = signal('');

  private statusTimeout?: ReturnType<typeof setTimeout>;

  public async ngOnInit(): Promise<void> {
    this.webSocket
      .on<ChatMessage>(SocketEventType.MESSAGE_REPLY)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        if (message.roomName !== this.roomName()) {
          return;
        }

        if (message.messageType === ChatMessageType.COMMENT_ADDED) {
          this.messages.update((messages) => [...messages, message]);
        } else if (message.messageType === ChatMessageType.USER_TYPING) {
          this.showStatus(this.text().clientTyping(message.clientName));
        }
      });

    this.webSocket
      .onClientConnected()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.showStatus(this.text().clientConnected));

    this.webSocket
      .onClientDisconnected()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.showStatus(this.text().clientDisconnected));

    this.webSocket
      .onError()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this.showStatus(this.text().error(error.message)));

    this.webSocket
      .onConnectionError()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this.showStatus(this.text().connectionError(error.message)));

    if (!this.webSocket.connected()) {
      this.webSocket.connect();
    }

    const ack = await this.webSocket.joinRoom({ roomName: this.roomName() });
    this.clientId.set(ack.clientId);
  }

  public ngOnDestroy(): void {
    clearTimeout(this.statusTimeout);
    void this.webSocket.leaveRoom({ roomName: this.roomName() });
  }

  protected onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);

    if (this.draft().length > 0) {
      this.sendTyping();
    }
  }

  protected sendMessage(): void {
    const text = this.draft().trim();
    if (!text) {
      return;
    }

    this.webSocket.send<ChatMessage>(
      SocketMessageType.MESSAGE,
      this.buildMessage(text, ChatMessageType.COMMENT_ADDED),
    );
    this.draft.set('');
  }

  private sendTyping(): void {
    this.webSocket.send<ChatMessage>(
      SocketMessageType.MESSAGE,
      this.buildMessage('', ChatMessageType.USER_TYPING, false),
    );
  }

  private buildMessage(
    text: string,
    messageType: ChatMessageType,
    replyToSender = true,
  ): ChatMessage {
    return {
      id: crypto.randomUUID(),
      clientId: this.clientId(),
      clientName: this.clientName(),
      roomName: this.roomName(),
      messageType,
      message: text,
      replyToSender,
      timestamp: Temporal.Now.instant().toString({ smallestUnit: 'second' }),
    };
  }

  private showStatus(message: string): void {
    this.statusMessage.set(message);
    clearTimeout(this.statusTimeout);
    this.statusTimeout = setTimeout(() => this.statusMessage.set(null), STATUS_MESSAGE_DURATION_MS);
  }
}
