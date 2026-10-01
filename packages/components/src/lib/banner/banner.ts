import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Message } from '../models/message.model';

/** A stack of info/warning/error lines, one block per `Message`, each with an icon for its type.
 *  No Material dependency — plain inline SVG icons and CSS-variable colours with hex fallbacks, same
 *  "usable in any app, Material-themed or not" reasoning as `ngx-ai-tools`' components. */
@Component({
  selector: 'ngx-banner',
  standalone: true,
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Banner {
  public readonly messages = input.required<Message[]>();
}
