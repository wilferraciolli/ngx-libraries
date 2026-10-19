import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ChatMessage } from '../../interfaces/chat-message.interface';

/** Renders one `ChatMessage`, aligned right when it's from `clientId` (the viewer). */
@Component({
  selector: 'ngx-chat-message-bubble',
  standalone: true,
  imports: [],
  templateUrl: './chat-message-bubble.html',
  styleUrl: './chat-message-bubble.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageBubble {
  public readonly clientId = input.required<string>();
  public readonly message = input.required<ChatMessage>();

  protected readonly isSelf = computed(() => this.clientId() === this.message().clientId);
}
