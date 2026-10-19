import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ContentLoader } from '../content-loader/content-loader';

/** Skeleton for a card with an avatar + title/subtitle header and a body, YouTube-style. */
@Component({
  selector: 'ngx-card-loader',
  // Decorative: put aria-busy="true" on the region being filled, and announce the result there.
  host: { 'aria-hidden': 'true' },
  standalone: true,
  imports: [ContentLoader],
  templateUrl: './card-loader.html',
  styleUrl: './card-loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLoader {
  public readonly lines = input(2);
}
