import type { Injector, Type } from '@angular/core';

export type ModalSide = 'left' | 'right';

export interface ModalConfig<TData = unknown> {
  /** Passed to the content component via `setInput('data', ...)` — declare a matching `data`
   *  input (`data = input<TData>()`, or `@Input() data?: TData`) to receive it. */
  data?: TData;
  /** Shown in the shell's header, next to the close button. Omit for no header text. */
  title?: string;
  /** Overrides the default `var(--ngx-modal-width, 33vw)`. Ignored below the CDK's `XSmall`
   *  breakpoint, where the panel is always full screen. */
  width?: string;
  /** Which edge the panel docks to. Default `'right'`. Ignored below the CDK's `XSmall`
   *  breakpoint, where the panel is always full screen. */
  side?: ModalSide;
  /** `false` leaves the page behind the panel usable: no dimming, no click-blocking, page scroll
   *  kept. For panels that sit beside the content they describe (an org chart's node details).
   *  Default `true`. */
  backdrop?: boolean;
  /** Adds a minimize button: the panel shrinks to a small bar at the bottom of its edge (title,
   *  restore, close) and comes back where it was. Default `false`. */
  minimizable?: boolean;
  /** Accessible name for the dialog surface, when `title` alone isn't descriptive enough (or
   *  there's no `title` at all). */
  ariaLabel?: string;
  /** Injector the content component resolves its dependencies from — pass the opener's
   *  `inject(Injector)` so the content gets the opener's component-level providers (a
   *  feature-local store, say). Defaults to the root injector, as with `MatDialog`. */
  injector?: Injector;
}

/** Internal — the data `ModalService.open()` hands to the shell it creates. */
export interface ModalShellData<TData = unknown> {
  contentComponent: Type<unknown>;
  contentData: TData | undefined;
  title: string | undefined;
  width: string;
  side: ModalSide;
  minimizable: boolean;
}
