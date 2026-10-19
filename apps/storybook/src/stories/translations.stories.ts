import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TranslationsDemoHost } from './translations/translations-demo-host';

const meta: Meta<TranslationsDemoHost> = {
  title: 'ngx-translations/TranslationsService',
  component: TranslationsDemoHost,
  decorators: [moduleMetadata({ imports: [TranslationsDemoHost] })],
  parameters: {
    docs: {
      description: {
        component: `Instant (no-reload) language switching on Transloco: \`TranslationsService.t()\`/the \`t\` pipe, plus locale-aware \`formatDate()\`/\`formatNumber()\`.

This catalogue switches locale through the **Locale** toolbar global (top of the page), not a picker inside the story — every page here shares one \`TranslationsService\` instance via \`provideTranslations()\` in \`.storybook/preview.ts\`. In a real app you'd call \`TranslationsService.setLocale()\` from your own switcher.

A key with no entry in the active dictionary renders as the key itself — see the last line below.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<TranslationsDemoHost>;

export const Default: Story = {};
