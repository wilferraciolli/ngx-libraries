// Barrel — re-export the entire public surface
// Add exports here as the library grows

export { AiSparkleIcon } from './lib/components/ai-sparkle-icon/ai-sparkle-icon';
export { AiPanel } from './lib/components/ai-panel/ai-panel';
export { AiTextBox } from './lib/components/ai-text-box/ai-text-box';
export { AiButton } from './lib/components/ai-button/ai-button';
export { AiGenerate } from './lib/components/ai-generate/ai-generate';

export { NGX_AI_GENERATOR, provideAiGenerator } from './lib/generation/ai-generator';
export type {
  AiGenerateRequest,
  AiGenerateResult,
  AiGenerator,
} from './lib/generation/ai-generator';
