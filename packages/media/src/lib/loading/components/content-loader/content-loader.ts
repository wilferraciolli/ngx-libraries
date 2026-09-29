import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Fills whatever space its container gives it with paragraph-shaped shimmer lines. */
@Component({
  selector: 'ngx-content-loader',
  // Decorative: put aria-busy="true" on the region being filled, and announce the result there.
  host: { 'aria-hidden': 'true' },
  standalone: true,
  imports: [],
  templateUrl: './content-loader.html',
  styleUrl: './content-loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentLoader {
  public readonly lines = input(3);

  protected readonly lineIndexes = computed(() => Array.from({ length: this.lines() }, (_, i) => i));
}
