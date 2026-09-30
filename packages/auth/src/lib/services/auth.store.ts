import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Clerk } from '@clerk/clerk-js';
import { NGX_AUTH_CONFIG } from '../config/auth-config.token';

type ClerkUser = Clerk['user'];
type ClerkSession = Clerk['session'];

interface AuthState {
  user: ClerkUser;
  session: ClerkSession;
}

/**
 * App-wide "who is signed in" state, backed by Clerk — inject it anywhere, the same way an app
 * injects its own `CurrentUserStore`. `init()` must run once, from `provideAuth()`'s
 * `provideAppInitializer`, before the app renders, so `authGuard`/`authInterceptor` never race a
 * not-yet-loaded Clerk instance.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly config = inject(NGX_AUTH_CONFIG);
  private clerk: Clerk | null = null;

  private readonly state = signal<AuthState>({ user: undefined, session: undefined });

  public readonly user: Signal<ClerkUser> = computed(() => this.state().user);
  public readonly session: Signal<ClerkSession> = computed(() => this.state().session);
  public readonly isSignedIn: Signal<boolean> = computed(() => this.state().session != null);

  /** Loads the Clerk SDK and starts tracking session changes. Call once, at startup. */
  public async init(): Promise<void> {
    const instance = new Clerk(this.config.clerkPublishableKey);
    await instance.load();
    this.clerk = instance;

    // Clerk's documented pattern for non-React ("headless") integrations — exposes the instance as
    // `window.Clerk`, for tooling that expects it there (e.g. `@clerk/testing`'s Playwright helpers).
    (window as unknown as { Clerk: Clerk }).Clerk = instance;

    this.state.set({ user: instance.user, session: instance.session });
    instance.addListener(({ user, session }) => {
      this.state.set({ user, session });
    });
  }

  /**
   * `NgxAuthConfig.jwtTemplate`, if set, selects a named JWT template's token instead of the
   * default session token (see that field's own doc for why an app would set it). This is what
   * `authInterceptor` calls; call it directly only for a non-HTTP use, e.g. a websocket handshake.
   */
  public async getToken(): Promise<string | null> {
    const { jwtTemplate } = this.config;
    return (
      (await this.clerk?.session?.getToken(jwtTemplate ? { template: jwtTemplate } : undefined)) ??
      null
    );
  }

  /**
   * Full-page redirect to Clerk's hosted Account Portal, then back here. **Never call
   * `clerk.mountSignIn()`/`mountUserButton()`/any other `mount*` method** — the npm build of
   * `@clerk/clerk-js` ships without the embedded UI components bundle (only available through
   * Clerk's React SDK); a `mount*` call throws `Error: Clerk was not loaded with Ui components` at
   * runtime, not at build time, so it slips past a typecheck and a first glance.
   * `redirectToSignIn()` is the one sign-in entry point that doesn't depend on that missing bundle,
   * and it behaves identically in a real browser and in Playwright.
   */
  public async signIn(): Promise<void> {
    await this.clerk?.redirectToSignIn({ redirectUrl: window.location.href });
  }

  public async signOut(): Promise<void> {
    await this.clerk?.signOut();
  }
}
