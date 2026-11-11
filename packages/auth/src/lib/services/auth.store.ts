import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import type { Clerk } from '@clerk/clerk-js';
import { NGX_AUTH_CONFIG } from '../config/auth-config.token';

type ClerkUser = Clerk['user'];
type ClerkSession = Clerk['session'];
type ClerkConstructor = typeof Clerk;

interface AuthState {
  user: ClerkUser;
  session: ClerkSession;
}

/**
 * App-wide "who is signed in" state, backed by Clerk — inject it anywhere, the same way an app
 * injects its own `CurrentUserStore`. `provideAuth()` starts it once, from `provideAppInitializer`;
 * `authGuard` and `authInterceptor` wait on `whenReady()`, so neither races a not-yet-loaded Clerk
 * instance, whether or not start-up waited for it (`NgxAuthConfig.waitAtStartup`). When Clerk can't
 * load (offline, an outage) the app still renders, signed out, with `isLoaded` false.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly config = inject(NGX_AUTH_CONFIG);
  private clerk: Clerk | null = null;
  private ready: Promise<void> | null = null;

  private readonly state = signal<AuthState>({ user: undefined, session: undefined });
  private readonly loaded = signal(false);
  private readonly settled = signal(false);

  public readonly user: Signal<ClerkUser> = computed(() => this.state().user);
  public readonly session: Signal<ClerkSession> = computed(() => this.state().session);
  public readonly isSignedIn: Signal<boolean> = computed(() => this.state().session != null);
  /**
   * Whether Clerk has loaded. False while it loads (past `loadTimeoutMs`), and for good when it
   * couldn't: the app then runs signed out, `signIn()` does nothing, and `getToken()` gives `null`.
   */
  public readonly isLoaded: Signal<boolean> = this.loaded.asReadonly();
  /**
   * Whether loading is over, either way: Clerk loaded (`isLoaded` true) or couldn't. Until then
   * `isSignedIn` is false only because nothing is known yet, so a page that shows a signed-out
   * version (a sign-in button) should wait for this, or a signed-in visitor sees it flash.
   */
  public readonly isSettled: Signal<boolean> = this.settled.asReadonly();

  /**
   * Loads the Clerk SDK and starts tracking session changes. `provideAuth()` calls it once, at
   * startup; an app never needs to. Never rejects: a Clerk that can't load leaves the app signed
   * out rather than not rendering at all. With `NgxAuthConfig.loadTimeoutMs` it returns after that
   * long even if Clerk hasn't finished, and the state follows once it has.
   */
  public init(): Promise<void> {
    return this.whenReady();
  }

  /**
   * Resolves once Clerk has loaded or given up, or once `loadTimeoutMs` has passed, whichever is
   * first; starts loading if nothing has yet. The same promise every time, so waiting on it costs
   * nothing after the first wait. `authGuard` and `authInterceptor` wait on this; call it yourself
   * only for a non-HTTP use that needs the session, e.g. a websocket handshake.
   */
  public whenReady(): Promise<void> {
    this.ready ??= this.start();
    return this.ready;
  }

  private async start(): Promise<void> {
    const loading = this.load().finally(() => this.settled.set(true));
    const { loadTimeoutMs } = this.config;
    if (loadTimeoutMs === undefined) {
      await loading;
      return;
    }
    await Promise.race([
      loading,
      new Promise<void>((resolve) => setTimeout(resolve, loadTimeoutMs)),
    ]);
  }

  private async load(): Promise<void> {
    let instance: Clerk;
    try {
      const ClerkSdk = await this.importSdk();
      instance = new ClerkSdk(this.config.clerkPublishableKey);
      await instance.load();
    } catch (error) {
      console.error('Clerk could not load: the app runs signed out.', error);
      return;
    }
    this.clerk = instance;

    // Clerk's documented pattern for non-React ("headless") integrations — exposes the instance as
    // `window.Clerk`, for tooling that expects it there (e.g. `@clerk/testing`'s Playwright helpers).
    (window as unknown as { Clerk: Clerk }).Clerk = instance;

    this.state.set({ user: instance.user, session: instance.session });
    this.loaded.set(true);
    instance.addListener(({ user, session }) => {
      this.state.set({ user, session });
    });
  }

  /**
   * Imported here, not at the top of the file: the Clerk SDK is most of an app's startup code, and
   * a dynamic import lets the app's bundler split it out of the main chunk. Two literal imports,
   * not one with a variable path, so the bundler can see both: each becomes its own chunk, and only
   * the one `sdkBuild` names is downloaded.
   */
  private async importSdk(): Promise<ClerkConstructor> {
    if (this.config.sdkBuild === 'no-rhc') {
      return (await import('@clerk/clerk-js/no-rhc')).Clerk;
    }
    return (await import('@clerk/clerk-js')).Clerk;
  }

  /**
   * `NgxAuthConfig.jwtTemplate`, if set, selects a named JWT template's token instead of the
   * default session token (see that field's own doc for why an app would set it). This is what
   * `authInterceptor` calls, after `whenReady()`; call it directly only for a non-HTTP use, e.g. a
   * websocket handshake, and wait on `whenReady()` first.
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
