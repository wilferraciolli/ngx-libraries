import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AiSparkleIcon } from '../ai-sparkle-icon/ai-sparkle-icon';

/** A gradient-filled button for AI actions, e.g. "Ask AI" / "Generate". */
@Component({
  selector: 'ngx-ai-button',
  standalone: true,
  imports: [AiSparkleIcon],
  templateUrl: './ai-button.html',
  styleUrl: './ai-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiButton {
  public readonly label = input.required<string>();
  public readonly disabled = input(false);
  public readonly clicked = output<void>();

  protected onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}
