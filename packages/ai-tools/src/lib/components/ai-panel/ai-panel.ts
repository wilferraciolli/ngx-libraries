import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AiSparkleIcon } from '../ai-sparkle-icon/ai-sparkle-icon';

/** A panel with a smooth animated gradient running around its border, AI-assist style. */
@Component({
  selector: 'ngx-ai-panel',
  standalone: true,
  imports: [AiSparkleIcon],
  templateUrl: './ai-panel.html',
  styleUrl: './ai-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiPanel {
  public readonly title = input<string>();
}
