import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

/** Full-width static container on `mat-card` — an icon (optional) and title on one line, an
 *  optional subheader on the next, same header rules as `Panel`; unlike `Panel` its content is
 *  always visible, there's no expand/collapse (a card isn't an accordion). */
@Component({
  selector: 'ngx-card',
  standalone: true,
  imports: [MatCardModule, MatIcon],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  public readonly header = input.required<string>();
  public readonly subheader = input<string>();
  public readonly icon = input<string>();
}
