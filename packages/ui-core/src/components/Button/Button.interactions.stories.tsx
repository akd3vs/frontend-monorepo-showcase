import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button/Interactions',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

// ─── Click Activation ────────────────────────────────────────────────────────

export const ClickActivation: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click me' });

    await userEvent.click(button);

    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// ─── Focus Ring on Tab ───────────────────────────────────────────────────────

export const FocusRingOnTab: Story = {
  args: {
    children: 'Focus me',
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Focus me' });

    await userEvent.tab();

    expect(button).toHaveFocus();
    // Verify focus-visible box-shadow is applied
    const computedStyle = window.getComputedStyle(button);
    expect(computedStyle.boxShadow).not.toBe('none');
    expect(computedStyle.boxShadow).not.toBe('');
  },
};

// ─── Enter Key Activation ────────────────────────────────────────────────────

export const EnterActivation: Story = {
  args: {
    children: 'Enter me',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Enter me' });

    button.focus();
    await userEvent.keyboard('{Enter}');

    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// ─── Space Key Activation ────────────────────────────────────────────────────

export const SpaceActivation: Story = {
  args: {
    children: 'Space me',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Space me' });

    button.focus();
    await userEvent.keyboard(' ');

    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// ─── Disabled Prevents Activation ────────────────────────────────────────────

export const DisabledPreventsActivation: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    size: 'md',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled' });

    await userEvent.click(button);

    expect(args.onClick).not.toHaveBeenCalled();
  },
};

// ─── Hover Style Change ──────────────────────────────────────────────────────

export const HoverStyleChange: Story = {
  args: {
    children: 'Hover me',
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Hover me' });

    const bgBefore = window.getComputedStyle(button).backgroundColor;

    await userEvent.hover(button);

    const bgAfter = window.getComputedStyle(button).backgroundColor;
    // Background should change on hover for primary variant
    expect(bgAfter).not.toBe(bgBefore);
  },
};

// ─── Dark Mode Interactions ──────────────────────────────────────────────────

const DarkModeDecorator = (Story: React.ComponentType) => {
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, []);
  return <Story />;
};

export const DarkModeClickActivation: Story = {
  decorators: [DarkModeDecorator],
  args: {
    children: 'Dark Click',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Dark Click' });

    await userEvent.click(button);

    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DarkModeFocusRing: Story = {
  decorators: [DarkModeDecorator],
  args: {
    children: 'Dark Focus',
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Dark Focus' });

    await userEvent.tab();

    expect(button).toHaveFocus();
    const computedStyle = window.getComputedStyle(button);
    expect(computedStyle.boxShadow).not.toBe('none');
    expect(computedStyle.boxShadow).not.toBe('');
  },
};

export const DarkModeEnterActivation: Story = {
  decorators: [DarkModeDecorator],
  args: {
    children: 'Dark Enter',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Dark Enter' });

    button.focus();
    await userEvent.keyboard('{Enter}');

    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DarkModeSpaceActivation: Story = {
  decorators: [DarkModeDecorator],
  args: {
    children: 'Dark Space',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Dark Space' });

    button.focus();
    await userEvent.keyboard(' ');

    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DarkModeDisabledPreventsActivation: Story = {
  decorators: [DarkModeDecorator],
  args: {
    children: 'Dark Disabled',
    variant: 'primary',
    size: 'md',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Dark Disabled' });

    await userEvent.click(button);

    expect(args.onClick).not.toHaveBeenCalled();
  },
};
