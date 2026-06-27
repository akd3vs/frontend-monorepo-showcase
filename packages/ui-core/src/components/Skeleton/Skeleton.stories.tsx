import React from 'react';

import { Skeleton } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'rectangular', 'circular'],
    },
    width: { control: 'text' },
    height: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

// Variant stories
export const Text: Story = {
  args: {
    variant: 'text',
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
  },
};

// Custom sizes
export const TextCustomWidth: Story = {
  args: {
    variant: 'text',
    width: '200px',
  },
};

export const RectangularCustomSize: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '200px',
  },
};

export const CircularLarge: Story = {
  args: {
    variant: 'circular',
    width: '80px',
    height: '80px',
  },
};

// All variants together
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
      <div>
        <p style={{ margin: '0 0 8px 0', fontFamily: 'sans-serif', fontSize: '12px', color: '#666' }}>Text variant</p>
        <Skeleton variant="text" />
        <div style={{ height: '8px' }} />
        <Skeleton variant="text" width="75%" />
        <div style={{ height: '8px' }} />
        <Skeleton variant="text" width="50%" />
      </div>
      <div>
        <p style={{ margin: '0 0 8px 0', fontFamily: 'sans-serif', fontSize: '12px', color: '#666' }}>Rectangular variant</p>
        <Skeleton variant="rectangular" height="120px" />
      </div>
      <div>
        <p style={{ margin: '0 0 8px 0', fontFamily: 'sans-serif', fontSize: '12px', color: '#666' }}>Circular variant</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Skeleton variant="circular" width="32px" height="32px" />
          <Skeleton variant="circular" width="48px" height="48px" />
          <Skeleton variant="circular" width="64px" height="64px" />
        </div>
      </div>
    </div>
  ),
};
