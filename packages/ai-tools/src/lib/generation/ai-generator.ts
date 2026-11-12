import { InjectionToken } from '@angular/core';
import type { FactoryProvider } from '@angular/core';

/** What the user asked the AI to write. */
export interface AiGenerateRequest {
  /** The user's instruction, e.g. "A LinkedIn post about our payroll software". */
  prompt: string;
}

/** Generated content: a headline and the text under it. */
export interface AiGenerateResult {
  title: string;
  body: string;
}

/**
 * Turns a prompt into content. The consuming app implements it, normally by calling its own
 * backend, which holds the provider's API key (Groq, Workers AI, ...) — a key must never reach
 * the browser.
 *
 * `signal` aborts when the request is no longer wanted (the component was destroyed); pass it on
 * to `fetch` where you can, and reject once it aborts.
 */
export interface AiGenerator {
  generate(request: AiGenerateRequest, signal: AbortSignal): Promise<AiGenerateResult>;
}

/** The app's `AiGenerator`, used by `AiGenerate`. Provide it with `provideAiGenerator()`. */
export const NGX_AI_GENERATOR: InjectionToken<AiGenerator> = new InjectionToken<AiGenerator>(
  'NGX_AI_GENERATOR',
);

/**
 * Provides the app's `AiGenerator`. `factory` runs in an injection context, so it can `inject()`
 * the app's API service. Use it in `app.config.ts`, or in a component's `providers` to scope a
 * different generator to one screen.
 */
export function provideAiGenerator(factory: () => AiGenerator): FactoryProvider {
  return { provide: NGX_AI_GENERATOR, useFactory: factory };
}
