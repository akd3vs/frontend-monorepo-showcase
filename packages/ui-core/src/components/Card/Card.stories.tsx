import React from 'react';

import { Card, CardLegacy } from './index';

import type { Meta, StoryObj } from '@storybook/react';

// ─── Legacy Prop-Based API Stories ───────────────────────────────────────────

const meta: Meta<typeof CardLegacy> = {
  title: 'Components/Card',
  component: CardLegacy,
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CardLegacy>;

export const WithTitleAndBody: Story = {
  args: {
    title: 'Card Title',
    children: 'Card body content with a title header displayed above.',
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Card with Footer',
    children: 'Card body content with a footer section below.',
    footer: 'Footer text — additional context or actions',
  },
};

export const WithoutFooter: Story = {
  args: {
    title: 'Card without Footer',
    children: 'This card has a title and body but no footer section.',
  },
};

export const WithoutTitle: Story = {
  args: {
    children: 'Card body content without a title. The header is not rendered.',
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

// ─── Compound Component API Stories ──────────────────────────────────────────

export const CompoundBasic: StoryObj<typeof Card> = {
  render: () => (
    <Card aria-label="Compound card example">
      <Card.Header>Card Title</Card.Header>
      <Card.Body>This is the card body using the compound component API.</Card.Body>
    </Card>
  ),
};

export const CompoundWithFooter: StoryObj<typeof Card> = {
  render: () => (
    <Card aria-label="Card with footer">
      <Card.Header>Card Title</Card.Header>
      <Card.Body>Card body content with a footer section below.</Card.Body>
      <Card.Footer>Footer text — additional context</Card.Footer>
    </Card>
  ),
};

export const CompoundWithActions: StoryObj<typeof Card> = {
  render: () => (
    <Card aria-label="Card with actions">
      <Card.Header>Card with Actions</Card.Header>
      <Card.Body>This card demonstrates the Card.Actions sub-component for action buttons.</Card.Body>
      <Card.Actions>
        <button style={{ padding: '4px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
        <button style={{ padding: '4px 12px', border: 'none', borderRadius: '4px', background: '#2563eb', color: 'white', cursor: 'pointer' }}>Save</button>
      </Card.Actions>
    </Card>
  ),
};
