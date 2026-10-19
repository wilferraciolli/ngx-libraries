import { InjectionToken } from '@angular/core';

/** `ChatRoom`'s own overridable UI strings — every message body itself is still app/server data. */
export interface ChatText {
  connected: string;
  connecting: string;
  messagesLabel: string;
  messageLabel: string;
  composerPlaceholder: string;
  sendMessage: string;
  clientConnected: string;
  clientDisconnected: string;
  clientTyping: (clientName: string) => string;
  error: (message: string) => string;
  connectionError: (message: string) => string;
}

export const DEFAULT_CHAT_TEXT: ChatText = {
  connected: 'Connected',
  connecting: 'Connecting…',
  messagesLabel: 'Messages',
  messageLabel: 'Message',
  composerPlaceholder: 'Type a message…',
  sendMessage: 'Send message',
  clientConnected: 'A client connected',
  clientDisconnected: 'A client disconnected',
  clientTyping: (clientName) => `${clientName} is typing…`,
  error: (message) => `Error: ${message}`,
  connectionError: (message) => `Connection error: ${message}`,
};

/** A plain function the app supplies, read fresh on every read — see `NGX_CHAT_TEXT`. */
export type ChatTextResolver = () => ChatText;

/**
 * `ChatRoom`'s own UI text (connection status, composer placeholder, transient status messages) —
 * message *bodies* are still app/server data, never touched by this. Defaults to English; override
 * to translate it, e.g. wired to `ngx-translations`:
 *
 * ```ts
 * {
 *   provide: NGX_CHAT_TEXT,
 *   useFactory: () => {
 *     const translations = inject(TranslationsService);
 *     return () => ({ ...DEFAULT_CHAT_TEXT, connected: translations.t('chat.connected'), ... });
 *   }
 * }
 * ```
 *
 * A plain function rather than a direct import of `ngx-translations`' `TranslationsService`, so this package
 * stays buildable and publishable on its own — same reasoning as `ngx-dates`' `NGX_DATES_LOCALE`
 * (see root `CLAUDE.md`'s "Inter-package deps"). Read inside a `computed()` in `ChatRoom`, so a
 * resolver that internally reads a signal (as the recipe above does) stays reactive to a language
 * switch despite being "just a function" from this package's point of view.
 */
export const NGX_CHAT_TEXT = new InjectionToken<ChatTextResolver>('NGX_CHAT_TEXT', {
  factory: () => () => DEFAULT_CHAT_TEXT,
});
