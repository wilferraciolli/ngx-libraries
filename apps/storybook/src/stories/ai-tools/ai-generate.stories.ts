import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { AiGenerate, provideAiGenerator } from '@wiltech-labs/ngx-ai-tools';
import type { AiGenerateResult, AiGenerator } from '@wiltech-labs/ngx-ai-tools';
import { PostComposerHost } from './post-composer-host';

const DELAY_MS: number = 1000;

/** Resolves (or rejects) after a short delay, honouring the abort signal like a real call. */
function fakeGenerator(outcome: 'resolve' | 'reject'): AiGenerator {
  return {
    generate: ({ prompt }, signal: AbortSignal): Promise<AiGenerateResult> =>
      new Promise<AiGenerateResult>((resolve, reject): void => {
        const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
          if (outcome === 'reject') {
            reject(new Error('Story generator: rejected'));
            return;
          }
          resolve({
            title: prompt.charAt(0).toUpperCase() + prompt.slice(1),
            body: `A generated post about: ${prompt}.\n\nIt has a few lines,\nand ends with #hashtags.`,
          });
        }, DELAY_MS);
        signal.addEventListener('abort', (): void => clearTimeout(timer), { once: true });
      }),
  };
}

const meta: Meta<AiGenerate> = {
  title: 'ngx-ai-tools/AiGenerate',
  component: AiGenerate,
  decorators: [
    applicationConfig({ providers: [provideAiGenerator(() => fakeGenerator('resolve'))] }),
  ],
  parameters: {
    docs: {
      description: {
        component: `Prompt box and Generate button in an \`AiPanel\`. Sends the prompt to the app's \`AiGenerator\` and emits \`generated\` with \`{ title, body }\`.

The app supplies the generator with \`provideAiGenerator(() => ...)\`, normally a call to its own backend, which holds the AI provider's key. These stories use a fake one that answers after a second. Open the **Actions** panel to see \`generated\`/\`failed\`.`,
      },
    },
  },
  argTypes: {
    heading: { description: 'Panel heading.' },
    label: { description: 'Accessible name of the prompt box.' },
    placeholder: { description: 'Hint shown while the prompt is empty.' },
    buttonLabel: { description: 'Button text when idle.' },
    generatingLabel: { description: 'Button text, and screen-reader announcement, while running.' },
    errorMessage: { description: 'Shown when the generator rejects.' },
    prompt: { description: 'Two-way bound prompt text (`model()`).' },
    generated: { description: 'Emits the `{ title, body }` the generator returned.' },
    failed: { description: "Emits the generator's rejection reason." },
  },
  args: { generated: fn(), failed: fn() },
};

export default meta;
type Story = StoryObj<AiGenerate>;

export const Default: Story = { args: {} };

export const Prefilled: Story = {
  args: { prompt: 'Why Wiltech Labs Payroll saves small businesses time' },
};

export const Failing: Story = {
  name: 'Error',
  decorators: [
    applicationConfig({ providers: [provideAiGenerator(() => fakeGenerator('reject'))] }),
  ],
  parameters: {
    docs: { description: { story: 'The generator rejects; click Generate to see the message.' } },
  },
  args: { prompt: 'Anything' },
};

export const CustomText: Story = {
  name: 'Custom text',
  args: {
    heading: 'Draft an article',
    label: 'Article topic',
    placeholder: 'What should the article cover?',
    buttonLabel: 'Draft',
    generatingLabel: 'Drafting…',
  },
};

export const WithPostFields: Story = {
  name: 'With post fields',
  parameters: {
    docs: {
      description: {
        story:
          'Typical use: the app copies `generated` into two `ngx-forms` fields (text + textarea), which stay editable.',
      },
    },
  },
  render: (args) => ({
    moduleMetadata: { imports: [PostComposerHost] },
    props: args,
    template: `<story-post-composer (generated)="generated($event)" (failed)="failed($event)" />`,
  }),
};
