import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Wiltech Labs logo in the sidebar header. The files come from packages/styles/src/logo, which
// main.ts serves at the root through `staticDirs`. Storybook's default UI theme follows the OS
// colour scheme, so this does too, picking the matching base and the matching lockup.
const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

addons.setConfig({
  theme: create({
    base: dark ? 'dark' : 'light',
    brandTitle: 'Wiltech Labs',
    brandImage: dark ? 'logo-dark.svg' : 'logo.svg',
    brandUrl: './',
    brandTarget: '_self',
  }),
});
