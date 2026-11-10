import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/angular', options: {} },
  docs: { defaultName: 'Docs' },
  // Serves the Wiltech Labs logo set at the root. Storybook picks up `favicon.svg` from a static
  // dir mapped to "/" and uses it as the manager's tab icon in place of its own.
  staticDirs: [{ from: '../../../packages/styles/src/logo', to: '/' }],
  webpackFinal: async (webpackConfig) => {
    // A few packages (api-client, modals, notifications, region-settings) import siblings with an
    // explicit `.js` extension on a `.ts` source file — valid under the repo's `moduleResolution:
    // "Bundler"` and how the Angular CLI/esbuild resolve it, but webpack's resolver (Storybook's
    // Angular builder) doesn't try a `.ts` file for a `.js` specifier on its own. `extensionAlias`
    // tells it to.
    webpackConfig.resolve ??= {};
    webpackConfig.resolve.extensionAlias = {
      ...webpackConfig.resolve.extensionAlias,
      '.js': ['.ts', '.js'],
    };
    return webpackConfig;
  },
};

export default config;
