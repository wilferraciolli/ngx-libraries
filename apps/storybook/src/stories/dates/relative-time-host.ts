import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RelativeTimePipe } from '@wiltech-labs/ngx-dates';

/** One Instant through `relativeTime`. The pipe re-renders on its own both as real time passes
 *  and on a locale switch — no manual refresh wiring needed in the story. */
@Component({
  selector: 'sb-relative-time-host',
  standalone: true,
  imports: [RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>
    {{ label() }}: <strong>{{ instant() | relativeTime }}</strong>
  </p>`,
})
export class RelativeTimeHost {
  public readonly instant = input.required<Date | string>();
  public readonly label = input('Instant');
}
