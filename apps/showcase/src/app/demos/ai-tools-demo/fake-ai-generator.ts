import type { AiGenerateRequest, AiGenerateResult, AiGenerator } from '@wiltech-labs/ngx-ai-tools';

const FAKE_DELAY_MS: number = 1200;

/**
 * Stand-in for a real backend call, so the composer can be tried without one. A prompt containing
 * the word "fail" rejects, to show the error state.
 *
 * A real app calls its backend instead, which holds the provider key:
 *   provideAiGenerator(() => {
 *     const api: ApiClientService = inject(ApiClientService);
 *     return { generate: (request) => api.post('post', '/ai/generate', request) };
 *   })
 */
export function createFakeAiGenerator(): AiGenerator {
  return {
    generate(request: AiGenerateRequest, signal: AbortSignal): Promise<AiGenerateResult> {
      return new Promise<AiGenerateResult>((resolve, reject): void => {
        const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
          if (/\bfail\b/i.test(request.prompt)) {
            reject(new Error('Fake generator: asked to fail'));
            return;
          }
          resolve(fakePost(request.prompt));
        }, FAKE_DELAY_MS);

        signal.addEventListener(
          'abort',
          (): void => {
            clearTimeout(timer);
            reject(signal.reason);
          },
          { once: true },
        );
      });
    },
  };
}

function fakePost(prompt: string): AiGenerateResult {
  const topic: string = prompt.replace(/[.!?]+$/, '');
  return {
    title: `${topic.charAt(0).toUpperCase()}${topic.slice(1)}`,
    body: [
      `Here's something worth sharing: ${topic}.`,
      '',
      '✅ Saves your team hours every week',
      '✅ Built for the way you already work',
      '✅ Backed by people who answer when you call',
      '',
      'Curious? Drop a comment or send us a message, we would love to show you around.',
      '',
      '#WiltechLabs #Productivity',
    ].join('\n'),
  };
}
