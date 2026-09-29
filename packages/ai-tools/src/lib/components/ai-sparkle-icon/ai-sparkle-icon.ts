import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextGradientId = 0;

/** The 4-pointed "sparkle"/diamond glyph used to mark AI features. */
@Component({
  selector: 'app-ai-sparkle-icon',
  standalone: true,
  imports: [],
  templateUrl: './ai-sparkle-icon.html',
  styleUrl: './ai-sparkle-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiSparkleIcon {
  public readonly size = input('24px');
  /** Use the surrounding text color instead of the built-in gradient fill — for use on a colored background. */
  public readonly monochrome = input(false);

  protected readonly gradientId = `ngx-ai-sparkle-gradient-${nextGradientId++}`;
}
