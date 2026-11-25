import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** Cloudflare's script, rendered explicitly so a widget appears only where a component asks. */
export const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileOptions {
  sitekey: string;
  action?: string;
  language?: string;
  theme?: 'auto' | 'light' | 'dark';
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
}

interface TurnstileApi {
  render(element: HTMLElement, options: TurnstileOptions): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

type TurnstileWindow = Window & { turnstile?: TurnstileApi };

let loading: Promise<TurnstileApi> | null = null;

/** Loads Cloudflare's script once per page, however many widgets there are. */
function loadTurnstile(document: Document): Promise<TurnstileApi> {
  const view = document.defaultView as TurnstileWindow | null;
  if (view?.turnstile) {
    return Promise.resolve(view.turnstile);
  }
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () => (view?.turnstile ? resolve(view.turnstile) : reject(new Error('no turnstile')));
    script.onerror = () => {
      loading = null; // a later widget tries again
      reject(new Error('Turnstile could not load'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * Cloudflare Turnstile's widget: shows a form was filled in by a person. It hands its token to
 * `token` once the check passes, and `null` when the token expires (after five minutes) or the check
 * fails, so the form sends the latest one with what it submits and the server verifies it
 * (`wiltech-labs-core`'s `get_turnstile`). A token is good once: after a refused submit, call
 * `reset()` for a new one. `failed` says the widget couldn't load or run (offline, blocked), for a
 * message beside it.
 *
 * ```html
 * <ngx-turnstile [siteKey]="siteKey" action="sign-up" (token)="token.set($event)" />
 * ```
 */
@Component({
  selector: 'ngx-turnstile',
  standalone: true,
  template: '<div #host class="NgxTurnstile"></div>',
  styles: ':host { display: block; min-height: 65px; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxTurnstile {
  /** The widget's site key (Cloudflare dashboard → Turnstile). Public: it belongs in the bundle. */
  public readonly siteKey = input.required<string>();
  /** Turnstile's `data-action`: the server can check the token was made for this form. */
  public readonly action = input<string | undefined>(undefined);
  /** `auto` (the browser's) or a language Turnstile has (`en`, `el`, `de`, ...). */
  public readonly language = input<string>('auto');
  public readonly theme = input<'auto' | 'light' | 'dark'>('auto');

  public readonly token = output<string | null>();
  public readonly failed = output<void>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly document = inject(DOCUMENT);
  private api: TurnstileApi | null = null;
  private widgetId: string | null = null;
  private destroyed = false;

  constructor() {
    afterNextRender(() => {
      void this.render();
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      if (this.api && this.widgetId) {
        this.api.remove(this.widgetId);
      }
    });
  }

  /** A fresh check, and so a fresh token (the last one has been used or refused). */
  public reset(): void {
    this.token.emit(null);
    if (this.api && this.widgetId) {
      this.api.reset(this.widgetId);
    }
  }

  private async render(): Promise<void> {
    try {
      this.api = await loadTurnstile(this.document);
    } catch {
      this.failed.emit();
      return;
    }
    if (this.destroyed) {
      return;
    }
    this.widgetId = this.api.render(this.host().nativeElement, {
      sitekey: this.siteKey(),
      action: this.action(),
      language: this.language(),
      theme: this.theme(),
      callback: (token: string) => this.token.emit(token),
      'expired-callback': () => this.token.emit(null),
      'error-callback': () => {
        this.token.emit(null);
        this.failed.emit();
      },
    });
  }
}
