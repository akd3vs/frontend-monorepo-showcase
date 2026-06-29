import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
  docs: {
    defaultName: 'Docs',
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: (config) => {
    return config;
  },
};

export default config;
