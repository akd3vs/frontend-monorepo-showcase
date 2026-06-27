import React from 'react';

import { Card } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'This is the card body content. It can contain any React elements.',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: 'Card body content with a title header displayed above.',
  },
};

export const WithoutTitle: Story = {
  args: {
    children: 'Card body content without a title. The header is not rendered.',
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Card with Footer',
    children: 'Card body content.',
    footer: 'Footer text — additional context or actions',
  },
};

export const WithAllProps: Story = {
  args: {
    title: 'Complete Card',
    children: (
      <div>
        <p style={{ margin: '0 0 8px 0' }}>This card has all props configured:</p>
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          <li>Title header</li>
          <li>Body content</li>
          <li>Footer section</li>
          <li>ARIA label</li>
        </ul>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button style={{ padding: '4px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
        <button style={{ padding: '4px 12px', border: 'none', borderRadius: '4px', background: '#2563eb', color: 'white', cursor: 'pointer' }}>Save</button>
      </div>
    ),
    'aria-label': 'Complete card example',
  },
};
