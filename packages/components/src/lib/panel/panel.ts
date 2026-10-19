import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';

/** Full-width expandable section on `mat-expansion-panel` — an icon (optional) and title on one
 *  line, an optional subheader on the next, both always visible; the body (any content the caller
 *  projects in) only shows once expanded. Real Angular Material here, not a from-scratch build
 *  (unlike `Banner`): the accordion mechanics (animation, keyboard a11y, ripple) are exactly what
 *  `mat-expansion-panel` already does correctly. */
@Component({
  selector: 'ngx-panel',
  standalone: true,
  imports: [MatExpansionModule, MatIcon],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Panel {
  public readonly header = input.required<string>();
  public readonly subheader = input<string>();
  public readonly icon = input<string>();
}
