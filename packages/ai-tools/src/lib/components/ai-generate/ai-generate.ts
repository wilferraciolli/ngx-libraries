import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import type {
  InputSignal,
  ModelSignal,
  OutputEmitterRef,
  Signal,
  WritableSignal,
} from '@angular/core';
import { NGX_AI_GENERATOR } from '../../generation/ai-generator';
import type { AiGenerateResult, AiGenerator } from '../../generation/ai-generator';
import { AiButton } from '../ai-button/ai-button';
import { AiPanel } from '../ai-panel/ai-panel';
import { AiTextBox } from '../ai-text-box/ai-text-box';

/**
 * Prompt box + Generate button in an `AiPanel`. Sends the prompt to the app's `AiGenerator`
 * (see `provideAiGenerator()`) and emits the `{ title, body }` it returns; where that content goes
 * (form fields, a preview) is up to the app. Every string is an input.
 */
@Component({
  selector: 'ngx-ai-generate',
  standalone: true,
  imports: [AiPanel, AiTextBox, AiButton],
  templateUrl: './ai-generate.html',
  styleUrl: './ai-generate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiGenerate {
  /** Panel heading. */
  public readonly heading: InputSignal<string> = input('Generate with AI');
  /** Accessible name of the prompt box. */
  public readonly label: InputSignal<string> = input('Describe what to write');
  public readonly placeholder: InputSignal<string> = input('Tell the AI what to write about…');
  public readonly buttonLabel: InputSignal<string> = input('Generate');
  /** Shown on the button, and announced to screen readers, while a request runs. */
  public readonly generatingLabel: InputSignal<string> = input('Generating…');
  /** Shown when the generator rejects. */
  public readonly errorMessage: InputSignal<string> = input(
    'Something went wrong. Please try again.',
  );

  /** The prompt text, two-way bindable so the app can prefill or keep it. */
  public readonly prompt: ModelSignal<string> = model('');

  /** The generated content. */
  public readonly generated: OutputEmitterRef<AiGenerateResult> = output<AiGenerateResult>();
  /** The generator's rejection reason, for the app to log. The message is shown regardless. */
  public readonly failed: OutputEmitterRef<unknown> = output<unknown>();

  protected readonly generating: WritableSignal<boolean> = signal(false);
  protected readonly hasError: WritableSignal<boolean> = signal(false);
  protected readonly canGenerate: Signal<boolean> = computed(
    () => !this.generating() && this.prompt().trim().length > 0,
  );

  private readonly generator: AiGenerator = injectGenerator();
  private controller: AbortController | null = null;

  constructor() {
    inject(DestroyRef).onDestroy((): void => this.controller?.abort());
  }

  protected async generate(): Promise<void> {
    if (!this.canGenerate()) {
      return;
    }

    const controller: AbortController = new AbortController();
    this.controller = controller;
    this.generating.set(true);
    this.hasError.set(false);

    try {
      const result: AiGenerateResult = await this.generator.generate(
        { prompt: this.prompt().trim() },
        controller.signal,
      );
      if (!controller.signal.aborted) {
        this.generated.emit(result);
      }
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        this.hasError.set(true);
        this.failed.emit(error);
      }
    } finally {
      if (this.controller === controller) {
        this.controller = null;
        this.generating.set(false);
      }
    }
  }
}

function injectGenerator(): AiGenerator {
  const generator: AiGenerator | null = inject(NGX_AI_GENERATOR, { optional: true });
  if (!generator) {
    throw new Error(
      'ngx-ai-generate: no AI generator provided. Add provideAiGenerator(...) to your app ' +
        "config (or the component's providers).",
    );
  }
  return generator;
}
