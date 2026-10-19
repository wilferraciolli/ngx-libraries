import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { ThemeSwitcher, provideThemes } from '@wiltech-labs/ngx-themes';

const meta: Meta<ThemeSwitcher> = {
  title: 'ngx-themes/ThemeSwitcher',
  component: ThemeSwitcher,
  parameters: {
    docs: {
      description: {
        component: `Navbar control from \`@wiltech-labs/ngx-themes\`: the sun/moon button flips light/dark, the palette menu picks a family or hands the mode back to the OS ("Match system").

- \`ThemeService\` only sets \`data-theme\` and \`color-scheme\` on \`<html>\` and remembers both in \`localStorage\`. The palettes are the app's own SCSS: one \`html[data-theme='<id>']\` block per family.
- Register families with \`provideThemes({ families, storageKeyPrefix })\`. With no families, it's a light/dark toggle only.
- Storybook loads only the minimalistic palette, so picking another family here changes nothing visible. Run the showcase to see real family switches.
- The toolbar's **Theme** control overrides the mode again on the next re-render.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ThemeSwitcher>;

/** Families as the showcase registers them — only `minimalistic` has a palette loaded in Storybook. */
export const Default: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideThemes({
          families: [
            { id: 'minimalistic', label: 'Minimalistic' },
            { id: 'teal', label: 'Teal' },
            { id: 'magenta', label: 'Magenta' },
            { id: 'red-yellow', label: 'Red & Yellow' },
          ],
          storageKeyPrefix: 'storybook.theme',
        }),
      ],
    }),
  ],
};

/** No families configured: the palette menu holds only "Match system". */
export const LightDarkOnly: Story = {
  decorators: [
    applicationConfig({
      providers: [provideThemes({ families: [], storageKeyPrefix: 'storybook.theme-mode-only' })],
    }),
  ],
};
