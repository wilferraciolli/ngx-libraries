import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { AiSparkleIcon } from '../ai-sparkle-icon/ai-sparkle-icon';

/** A text box with a smooth animated gradient running around its border, AI-assist style. */
@Component({
  selector: 'ngx-ai-text-box',
  standalone: true,
  imports: [AiSparkleIcon],
  templateUrl: './ai-text-box.html',
  styleUrl: './ai-text-box.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiTextBox {
  public readonly value = model('');
  public readonly placeholder = input('Ask AI anything…');
  /** Accessible name of the prompt field — the placeholder alone isn't a label. */
  public readonly label = input('Ask AI');

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }
}
