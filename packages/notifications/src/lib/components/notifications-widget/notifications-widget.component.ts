import { A11yModule } from '@angular/cdk/a11y';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { NGX_NOTIFICATIONS_TEXT } from '../../config/notifications-text.token.js';
import { NotificationsService } from '../../services/notifications.service.js';

/**
 * A bell + unread badge that opens a right-docked panel (CDK Overlay, no Angular Material) listing
 * `NotificationsService.notifications()` — full viewport height, a third of the screen wide by
 * default (`--ngx-notifications-width`), full screen below the CDK's `XSmall` breakpoint, same
 * visual contract as `@wiltech-labs/ngx-modals`' right-panel, implemented natively here rather than
 * as a dependency on that package (see root `CLAUDE.md`'s "Inter-package deps" — `ngx-modals` isn't
 * one of the two sanctioned exceptions). Drop it into a nav bar — no inputs are required, but you
 * almost always want to project your own item template, since this package has no idea what a
 * notification's fields are called:
 *
 * ```html
 * <ngx-notifications>
 *   <ng-template let-notification>
 *     <strong>{{ notification.title }}</strong>
 *     <p>{{ notification.body }}</p>
 *   </ng-template>
 * </ngx-notifications>
 * ```
 */
@Component({
  selector: 'ngx-notifications',
  standalone: true,
  imports: [OverlayModule, A11yModule, NgTemplateOutlet, JsonPipe],
  templateUrl: './notifications-widget.component.html',
  styleUrl: './notifications-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsWidget<TNotification = unknown> {
  @ContentChild(TemplateRef)
  protected itemTemplate?: TemplateRef<{ $implicit: TNotification }>;

  @ViewChild('panel') private readonly panelTemplateRef!: TemplateRef<unknown>;

  protected readonly notifications =
    inject<NotificationsService<TNotification>>(NotificationsService);
  protected readonly text = inject(NGX_NOTIFICATIONS_TEXT);

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private overlayRef?: OverlayRef;
  private breakpointSubscription?: Subscription;

  protected readonly isOpen = signal(false);
  protected readonly triggerLabel = computed(() =>
    this.text().triggerLabel(this.notifications.unreadCount()),
  );

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().top('0').right('0'),
      width: 'var(--ngx-notifications-width, 33vw)',
      height: '100vh',
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') this.close();
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTemplateRef, this.viewContainerRef));

    // Same responsive rule as ngx-modals' right panel: full screen below the XSmall breakpoint.
    this.breakpointSubscription = this.breakpointObserver
      .observe(Breakpoints.XSmall)
      .subscribe((result) => {
        this.overlayRef?.updateSize({
          width: result.matches ? '100vw' : 'var(--ngx-notifications-width, 33vw)',
        });
      });

    this.isOpen.set(true);
    void this.notifications.refresh();
  }

  protected close(): void {
    this.breakpointSubscription?.unsubscribe();
    this.breakpointSubscription = undefined;
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.isOpen.set(false);
  }

  protected select(notification: TNotification): void {
    this.notifications.open(notification);
    // Most apps navigate away inside openNotification(), but refresh anyway — an app whose
    // callback marks the item read server-side wants the badge to reflect that immediately, not
    // wait for the next poll tick.
    void this.notifications.refresh();
    this.close();
  }

  protected dismiss(notification: TNotification, event: Event): void {
    event.stopPropagation();
    void this.notifications.dismiss(notification);
  }
}
