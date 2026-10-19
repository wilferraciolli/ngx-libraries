# @wiltech-labs/ngx-notifications

A notification bell + badge + right-docked panel (full viewport height, a third of the screen wide
by default, full screen below the CDK's `XSmall` breakpoint — the same visual contract as
`@wiltech-labs/ngx-modals`' panel, see "Panel positioning" below for why it's not literally that
package), polling-based, fully app-pluggable — this package never touches an HTTP client or a
HATEOAS link directly. See root `../../CLAUDE.md` for repo-wide conventions.

Decided 2026-09-30: deliberately **not** folded into `ngx-media` (presentational/stateless, no
service layer) and deliberately **not** extending the `ngx-api-client`/`ngx-auth` sanctioned
dependency exception `ngx-region-settings` uses — see root `NEXT_STEPS.md` for the fuller decision
history and why this package stays a leaf in the _other_ direction (depends on nothing sibling,
rather than being depended on by anything).

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── config/             # NotificationsConfig/NGX_NOTIFICATIONS_CONFIG, NGX_NOTIFICATIONS_TEXT
    ├── services/
    │   └── notifications.service.ts   # NotificationsService — the poller
    ├── providers/
    │   └── provide-notifications.ts   # provideNotifications()
    └── components/
        └── notifications-widget/      # NotificationsWidget — bell/badge/right-docked panel
```

## Conventions

- **Stays fully app-pluggable — no dependency on `ngx-api-client`, unlike `ngx-region-settings`.**
  The app resolves its own person-profile `notifications` HATEOAS link and hands this package three
  plain callbacks (`fetchNotifications`/`dismissNotification`/`openNotification`) via
  `provideNotifications()`, the same "app supplies an opaque function" pattern as
  `ngx-translations`' `loader` / `ngx-dates`' `NGX_DATES_LOCALE`. An app can just as easily source
  `fetchNotifications` from `ngx-region-settings`' own `CurrentUserStore.link('notifications')` at
  the call site — that's an app-level composition choice, not a package dependency, and doesn't
  reopen the "two sanctioned exceptions" rule in root `CLAUDE.md`.
- **`provideNotifications()` takes a factory (`() => NotificationsConfig<T>`), not a plain config
  object** — caught during build, not designed upfront: `NotificationsService.refresh()` calls
  `fetchNotifications()`/`dismissNotification()` later, on a poll tick or a dismiss click, with no
  Angular injection context of their own. A callback that called `inject()` directly inside itself
  (the natural first thing to write, and what this package's own README's first draft did) would
  throw `NG0203` the first time a poll tick actually invoked it. Registering the config via
  `useFactory` instead — same fix `NGX_DATES_LOCALE`'s wiring recipe already uses — means the
  factory itself runs inside a real injection context exactly once, and the callbacks it returns
  close over whatever it `inject()`ed rather than injecting anything themselves.
- **Polling, not websockets** — confirmed explicitly during design, ruled out. `NotificationsService`
  (root-provided, one per app — same "one instance, self-managing" shape as `ngx-web-sockets`'
  `WebSocketService`) fetches once immediately at construction, then on a `setInterval` (default 5
  minutes, `config.pollIntervalMs` to override). No teardown — it's meant to live for the app's
  whole lifetime, same as `WebSocketService`'s connection.
- **`provideNotifications()` eagerly constructs the service via `provideAppInitializer`** — the same
  sequencing `ngx-auth`'s `provideAuth()` uses for `AuthStore` — so the first fetch is already in
  flight before `NotificationsWidget` (or anything else) would otherwise trigger construction by
  injecting the service.
- **Unread count is the app's own number, never computed here.** `NotificationsPage.unreadCount` is
  whatever the app's `fetchNotifications()` returns — this package has no idea what a notification
  item's fields are called, so it can't (and doesn't try to) filter items by a `read`/`unread` flag
  itself.
- **Dismiss re-fetches rather than optimistically updating local state.** `dismiss(notification)`
  calls `config.dismissNotification(notification)` then `refresh()` — one source of truth (the
  server), matching `ngx-region-settings`' `save()`/`reset()` → `resource.reload()` pattern, rather
  than this package maintaining its own guess at post-dismiss state.
- **Deep-link and dismiss are both app-supplied callbacks, not routes** — `openNotification` is
  called from the item's explicit action button (labelled `text().action`, default "View"), not the
  dismiss button; the app does its own `Router.navigate()` inside it. This package never imports
  `@angular/router`.
- **The item's own content is not a click target, decided 2026-09-30** — it was originally a big
  `<button>` wrapping the whole projected template, so clicking anywhere on an item (title, body, an
  accidental mis-click near the dismiss button) fired `openNotification()`. Changed to a plain `<div>`
  plus one explicit action button per item: scanning/reading a notification and _acting_ on it are
  now two distinct gestures, matching the dismiss button's own always-explicit affordance rather than
  having one implicit giant hit target and one explicit small one sitting next to each other.
- **Material-free, resolved as CDK Overlay + `@angular/cdk/a11y`'s `cdkTrapFocus`** — matches the
  `media`/`ai-tools`/`graphs`/`web-sockets` family rather than `forms`/`modals`. `NotificationsWidget`
  peer-depends on `@angular/cdk` directly (not `@angular/material`) — `Overlay`/`OverlayRef` (from
  `@angular/cdk/overlay`) handle positioning/backdrop-dismiss, `cdkTrapFocus` handles focus
  containment while the panel is open. No `MatBadge`/`MatMenu`.
- **Panel positioning, decided 2026-09-30**: right-docked, full height, `--ngx-notifications-width`
  (default `33vw`), full screen below `Breakpoints.XSmall` — deliberately the same visual contract as
  `ngx-modals`' panel, since a user opening either shouldn't see two different interaction patterns
  for "a panel slid in from the edge." Started as a small dropdown anchored under the trigger button
  (`cdkConnectedOverlay`/`cdkOverlayOrigin`, CDK's `FlexibleConnectedPositionStrategy`) — changed
  because that read as a cramped, half-finished modal rather than an intentional panel. **Not**
  implemented as a dependency on `@wiltech-labs/ngx-modals`: that's not one of root `CLAUDE.md`'s two
  sanctioned inter-package-dependency exceptions (`ngx-api-client`/`ngx-auth` only), so this package
  builds the same layout natively instead — imperative `Overlay.create()` with a global position
  strategy (`overlay.position().global().top('0').right('0')`, `width`/`height` in the `OverlayConfig`,
  `BreakpointObserver.observe(Breakpoints.XSmall)` calling `overlayRef.updateSize()` to go full-width
  below that breakpoint) rather than the `cdkConnectedOverlay` structural directive, which only
  supports origin-relative positioning, not a global dock. `NotificationsWidget` now owns its overlay
  lifecycle directly (`open()`/`close()`) instead of the declarative `[cdkConnectedOverlayOpen]`
  binding — `OverlayModule` is still imported for `Overlay`'s own provider (it isn't `providedIn:
'root'`), even though none of its structural directives are used anymore.
- **`NotificationsWidget<TNotification>` is generic**, same pattern as `ngx-region-settings`'
  `CurrentUserStore<TMe, TProfile>` — the item shape is genuinely unknowable by this package (no
  canonical API convention to default to here, unlike `ngx-region-settings`' `Me`/`RegionSettings`).
  Consumers who need item-level typing on the injected `NotificationsService` do
  `inject<NotificationsService<MyNotification>>(NotificationsService)`; generic parameters on a
  root-provided singleton are compile-time only, same reasoning documented in `ngx-modals`'
  `CLAUDE.md` for `MatDialogRef`.
- **Item rendering is content-projected** (`@ContentChild(TemplateRef)`), since the package can't
  know a notification's field names. No projected template falls back to a raw `{{ notification |
json }}` dump inside the panel — clearly a debug view, not a real empty state; almost every real
  usage should project its own `<ng-template let-notification>`.
- Text (`panelTitle`/`loading`/`empty`/`error`/`dismiss`/`close`/`triggerLabel`) comes from
  `NGX_NOTIFICATIONS_TEXT`, the same resolver-function pattern as `NGX_GRAPHS_TEXT`/`NGX_CHAT_TEXT`
  — override it (e.g. wired to `ngx-translations`) to translate it; leave it unset and it stays
  English.

## Status

- New package: `provideNotifications()`, `NotificationsService`, `NotificationsWidget`,
  `NotificationsConfig`/`NotificationsPage`, `NGX_NOTIFICATIONS_TEXT`.
- `tsc --noEmit` and `ng-packagr build` both clean.
- Wired into `apps/showcase` at `/notifications` (in-memory fake data, no backend). Checked live in a
  headless browser 2026-09-30 (no interactive browser-automation tool was available in earlier
  sessions, unlike the Playwright checks other demos got — this session used a Puppeteer script
  against system Chrome instead): panel opens right-docked at 33vw/100vh, the header icon well/title/
  "N unread" subtitle render, each item's "View" button marks it read and closes the panel (badge
  count drops), the X button dismisses without opening, Escape closes the panel, and both light and
  emulated dark `prefers-color-scheme` render correctly (all colours resolve through `--mat-sys-*`).
  No console errors in any of these checks.
- Not yet published to npm — under development.
- No consumers yet within this monorepo.
