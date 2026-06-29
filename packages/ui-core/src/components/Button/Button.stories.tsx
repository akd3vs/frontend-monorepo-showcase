import React from 'react';

import { Button } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ─── Primary Variant ─────────────────────────────────────────────────────────

export const PrimarySmall: Story = {
  args: { children: 'Primary Small', variant: 'primary', size: 'sm' },
};

export const PrimaryMedium: Story = {
  args: { children: 'Primary Medium', variant: 'primary', size: 'md' },
};

export const PrimaryLarge: Story = {
  args: { children: 'Primary Large', variant: 'primary', size: 'lg' },
};

// ─── Secondary Variant ───────────────────────────────────────────────────────

export const SecondarySmall: Story = {
  args: { children: 'Secondary Small', variant: 'secondary', size: 'sm' },
};

export const SecondaryMedium: Story = {
  args: { children: 'Secondary Medium', variant: 'secondary', size: 'md' },
};

export const SecondaryLarge: Story = {
  args: { children: 'Secondary Large', variant: 'secondary', size: 'lg' },
};

// ─── Ghost Variant ───────────────────────────────────────────────────────────

export const GhostSmall: Story = {
  args: { children: 'Ghost Small', variant: 'ghost', size: 'sm' },
};

export const GhostMedium: Story = {
  args: { children: 'Ghost Medium', variant: 'ghost', size: 'md' },
};

export const GhostLarge: Story = {
  args: { children: 'Ghost Large', variant: 'ghost', size: 'lg' },
};

// ─── Disabled States ─────────────────────────────────────────────────────────

export const PrimaryDisabled: Story = {
  args: { children: 'Disabled', variant: 'primary', size: 'md', disabled: true },
};

export const SecondaryDisabled: Story = {
  args: { children: 'Disabled', variant: 'secondary', size: 'md', disabled: true },
};

export const GhostDisabled: Story = {
  args: { children: 'Disabled', variant: 'ghost', size: 'md', disabled: true },
};

// ─── Showcase Grid ───────────────────────────────────────────────────────────

export const AllVariantsAndSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['primary', 'secondary', 'ghost'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ width: '80px', fontFamily: 'sans-serif', fontSize: '12px' }}>{variant}</span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={`${variant}-${size}`} variant={variant} size={size}>
              {size}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};
