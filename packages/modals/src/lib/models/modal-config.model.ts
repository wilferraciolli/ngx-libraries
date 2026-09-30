import type { Type } from '@angular/core';

export interface ModalConfig<TData = unknown> {
  /** Passed to the content component via `setInput('data', ...)` — declare a matching `data`
   *  input (`data = input<TData>()`, or `@Input() data?: TData`) to receive it. */
  data?: TData;
  /** Shown in the shell's header, next to the close button. Omit for no header text. */
  title?: string;
  /** Overrides the default `var(--ngx-modal-width, 33vw)`. Ignored below the CDK's `XSmall`
   *  breakpoint, where the panel is always full screen. */
  width?: string;
  /** Accessible name for the dialog surface, when `title` alone isn't descriptive enough (or
   *  there's no `title` at all). */
  ariaLabel?: string;
}

/** Internal — the data `ModalService.open()` hands to the shell it creates. */
export interface ModalShellData<TData = unknown> {
  contentComponent: Type<unknown>;
  contentData: TData | undefined;
  title: string | undefined;
}
